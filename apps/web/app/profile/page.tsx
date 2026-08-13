"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User, MapPin, Shield, LogOut, Settings, Camera, Save, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

const parsePostgisPoint = (val: string) => {
  if (!val) return null;
  if (val.startsWith('POINT')) {
    const match = val.match(/POINT\(([^ ]+)\s+([^)]+)\)/);
    if (match) return [parseFloat(match[2]), parseFloat(match[1])] as [number, number];
  }
  try {
    const bytes = new Uint8Array(val.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const view = new DataView(bytes.buffer);
    const lon = view.getFloat64(9, true);
    const lat = view.getFloat64(17, true);
    return [lat, lon] as [number, number];
  } catch (e) {
    return null;
  }
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    real_name: "",
    nickname: "",
    bio: "",
    age: "",
    phone_number: "",
    status: "Unspecified",
    gender: "Unspecified",
    default_radius_km: 5
  });
  const [pincode, setPincode] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [countryCode, setCountryCode] = useState("+91");
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/login");
      return;
    }
    
    setUser(user);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      let cc = "+91";
      let phone = data.phone_number || "";
      if (phone) {
        const match = phone.match(/^(\+\d{1,4})\s*(.*)$/);
        if (match) {
          cc = match[1];
          phone = match[2];
        }
      }
      setCountryCode(cc);
      
      if (data.default_location) {
        const coords = parsePostgisPoint(data.default_location);
        if (coords) setCoordinates(coords);
      }

      setProfile({
        real_name: data.real_name || "",
        nickname: data.nickname || "",
        bio: data.bio || "",
        age: data.age || "",
        phone_number: phone,
        status: data.status || "Unspecified",
        gender: data.gender || "Unspecified",
        default_radius_km: data.default_radius_km || 5
      });
    } else if (error && error.code === 'PGRST116') {
      // Profile doesn't exist yet, that's fine, we will create on save
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const payload: any = {
      id: user.id,
      ...profile,
      phone_number: `${countryCode} ${profile.phone_number}`.trim(),
      updated_at: new Date().toISOString(),
    };
    
    if (coordinates) {
      payload.default_location = `POINT(${coordinates[1]} ${coordinates[0]})`;
    }

    const { error } = await supabase
      .from("users")
      .upsert(payload);

    setSaving(false);
    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      alert("Profile saved securely!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] font-sans pb-32">
      {/* Header Banner */}
      <div className="h-48 bg-gradient-to-r from-gray-900 to-black w-full relative">
        <div className="absolute -bottom-16 left-0 right-0 max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden relative">
                  <User className="w-12 h-12 text-gray-400" />
                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all backdrop-blur-sm">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 rounded-full font-bold text-sm shadow-md hover:bg-red-50 transition-all border border-red-100 mb-4"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 space-y-8">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Public Profile</h2>
              <p className="text-gray-500 font-medium text-sm mt-1">This is how other students will see you.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-2xl border border-green-100">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Real Name (Private)</label>
                <input 
                  type="text" 
                  value={profile.real_name}
                  onChange={e => setProfile({...profile, real_name: e.target.value})}
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium" 
                  placeholder="John Doe" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Nickname (Public)</label>
                <input 
                  type="text" 
                  value={profile.nickname}
                  onChange={e => setProfile({...profile, nickname: e.target.value})}
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium" 
                  placeholder="JohnnyD" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mobile Number</label>
                <div className="flex bg-gray-50/50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all overflow-hidden">
                  <select 
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent pl-4 pr-2 py-3.5 text-gray-900 font-medium border-r border-gray-200 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                  <input 
                    type="tel" 
                    value={profile.phone_number}
                    onChange={e => setProfile({...profile, phone_number: e.target.value.replace(/[^0-9\s]/g, '')})}
                    className="block w-full px-3 py-3.5 bg-transparent text-gray-900 focus:outline-none font-medium" 
                    placeholder="99999 00000" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Age</label>
                <input 
                  type="number" 
                  value={profile.age}
                  onChange={e => setProfile({...profile, age: e.target.value})}
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium" 
                  placeholder="18" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Gender</label>
                <select 
                  value={profile.gender}
                  onChange={e => setProfile({...profile, gender: e.target.value})}
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium appearance-none"
                >
                  <option value="Unspecified">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Status</label>
                <select 
                  value={profile.status}
                  onChange={e => setProfile({...profile, status: e.target.value})}
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium appearance-none"
                >
                  <option value="Unspecified">Select Status</option>
                  <option value="Student">Student</option>
                  <option value="Worker">Worker</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Default Radius (km)</label>
                <input 
                  type="number" 
                  value={profile.default_radius_km}
                  onChange={e => setProfile({...profile, default_radius_km: parseInt(e.target.value) || 5})}
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium" 
                  placeholder="5" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Default Location (For Gigs)</label>
                <p className="text-xs text-gray-500 font-medium mb-3">Set your base location so we can match you with nearby gigs.</p>
                <input 
                  type="text" 
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="block w-full max-w-sm px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm mb-3" 
                  placeholder="Enter Pincode to jump map (e.g. 110001)" 
                  maxLength={6}
                />
                <MapPicker 
                  pincode={pincode} 
                  initialCoordinates={coordinates}
                  onLocationSelect={(lat, lng) => setCoordinates([lat, lng])} 
                />
                {coordinates && (
                  <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Location securely captured
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Bio</label>
              <textarea 
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
                className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium h-32 resize-none" 
                placeholder="I am a CS major, I can fix your laptop or help you move!"
              ></textarea>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-900 active:scale-95 transition-all shadow-lg shadow-black/20 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.01 }}
          className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Account Security</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Logged in as {user?.email}</p>
          </div>
          <button className="px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-100 transition-colors">
            Change Password
          </button>
        </motion.div>

      </div>
    </div>
  );
}
