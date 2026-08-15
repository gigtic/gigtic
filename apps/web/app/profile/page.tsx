"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User, MapPin, Shield, LogOut, Settings, Camera, Save, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
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
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    real_name: "",
    nickname: "",
    bio: "",
    age: "",
    phone_number: "",
    status: "Unspecified",
    gender: "Unspecified",
    default_radius_km: 5,
    profile_image_url: "",
    is_contact_masked: false
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
        default_radius_km: data.default_radius_km || 5,
        profile_image_url: data.profile_image_url || "",
        is_contact_masked: data.is_contact_masked || false
      });
    } else if (error && error.code === 'PGRST116') {
      // Profile doesn't exist yet, that's fine, we will create on save
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile_${Date.now()}.${fileExt}`;
    
    setLoading(true);
    try {
      const { error: uploadError, data } = await supabase.storage
        .from('gig-images')
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('gig-images')
        .getPublicUrl(data.path);
        
      setProfile(prev => ({ ...prev, profile_image_url: publicUrl }));
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setLoading(false);
    }
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
      toast.error("Error saving profile: " + error.message);
    } else {
      toast.success("Profile saved securely!");
      setIsEditing(false);
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
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Manage your public profile and private preferences.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all border border-gray-200"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        
        {/* Profile Information Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100"
        >
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50 flex items-center gap-6">
             <div className="relative group cursor-pointer shrink-0">
               <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden relative shadow-sm">
                 {profile.profile_image_url ? (
                   <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-10 h-10 text-gray-400" />
                 )}
                 {isEditing && (
                   <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer">
                     <Camera className="w-5 h-5 text-white" />
                     <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                   </label>
                 )}
               </div>
             </div>
             <div>
               <h2 className="text-xl font-black text-gray-900">Profile Picture</h2>
               <p className="text-gray-500 font-medium text-sm mt-1 mb-3">Upload a clear photo so people know who they are working with.</p>
               {isEditing && (
                 <label className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer">
                   Upload Photo
                   <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                 </label>
               )}
             </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Basic Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Real Name <span className="text-gray-400 font-medium">(Private)</span></label>
                <input 
                  type="text" 
                  value={profile.real_name}
                  onChange={e => setProfile({...profile, real_name: e.target.value})}
                  disabled={!isEditing}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed" 
                  placeholder="e.g. John Doe" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nickname <span className="text-gray-400 font-medium">(Public)</span></label>
                <input 
                  type="text" 
                  value={profile.nickname}
                  onChange={e => setProfile({...profile, nickname: e.target.value})}
                  disabled={!isEditing}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed" 
                  placeholder="e.g. JohnnyD" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bio <span className="text-gray-400 font-medium">(Public)</span></label>
              <textarea 
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
                disabled={!isEditing}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium h-28 resize-none disabled:opacity-60 disabled:cursor-not-allowed" 
                placeholder="Tell people about your skills, major, and what you can help with..."
              ></textarea>
            </div>
            
            <div className="flex items-center gap-3 p-5 bg-gray-50/80 border border-gray-200 rounded-2xl">
              <input
                type="checkbox"
                id="maskContactProfile"
                checked={profile.is_contact_masked}
                onChange={(e) => setProfile({...profile, is_contact_masked: e.target.checked})}
                className="w-5 h-5 text-black bg-white border-gray-300 rounded focus:ring-black"
                disabled={!isEditing}
              />
              <label htmlFor="maskContactProfile" className="text-sm font-semibold text-gray-900 cursor-pointer select-none">
                Mask my contact info (Phone & Email) from public view
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  If checked, users will not be able to unlock your direct contact details on your gigs.
                </p>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Personal Details Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 space-y-6"
        >
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Personal Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
              <div className="flex bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all overflow-hidden">
                <select 
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={!isEditing}
                  className="bg-transparent pl-4 pr-2 py-3 text-gray-900 font-bold border-r border-gray-200 focus:outline-none appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+61">+61</option>
                  <option value="+971">+971</option>
                </select>
                <input 
                  type="tel" 
                  value={profile.phone_number}
                  onChange={e => setProfile({...profile, phone_number: e.target.value.replace(/[^0-9\s]/g, '')})}
                  disabled={!isEditing}
                  className="block w-full px-3 py-3 bg-transparent text-gray-900 focus:outline-none font-medium disabled:opacity-60 disabled:cursor-not-allowed" 
                  placeholder="99999 00000" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
              <input 
                type="number" 
                value={profile.age}
                onChange={e => setProfile({...profile, age: e.target.value})}
                disabled={!isEditing}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed" 
                placeholder="18" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
              <select 
                value={profile.gender}
                onChange={e => setProfile({...profile, gender: e.target.value})}
                disabled={!isEditing}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="Unspecified">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Occupation Status</label>
              <select 
                value={profile.status}
                onChange={e => setProfile({...profile, status: e.target.value})}
                disabled={!isEditing}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="Unspecified">Select Status</option>
                <option value="Student">Student</option>
                <option value="Worker">Worker</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Location Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 space-y-6"
        >
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Location & Search Preferences</h3>
            {coordinates && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Location Saved
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Default Radius (km)</label>
              <input 
                type="number" 
                value={profile.default_radius_km}
                onChange={e => setProfile({...profile, default_radius_km: parseInt(e.target.value) || 5})}
                disabled={!isEditing}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed" 
                placeholder="5" 
              />
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                This is the maximum distance we'll search to find gigs around your default location.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Base Location</label>
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm" 
                    placeholder="Enter Pincode to quickly jump map (e.g. 110001)" 
                    maxLength={6}
                  />
                </div>
              )}
              <div className={`rounded-2xl overflow-hidden border border-gray-200 shadow-sm ${!isEditing ? 'pointer-events-none opacity-80' : ''}`}>
                <MapPicker 
                  pincode={pincode} 
                  initialCoordinates={coordinates}
                  onLocationSelect={(lat, lng) => isEditing && setCoordinates([lat, lng])} 
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-red-50/50 rounded-3xl p-6 sm:p-8 border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-bold text-red-900 text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" /> Account Security
            </h3>
            <p className="text-sm font-medium text-red-700/70 mt-1">Logged in as {user?.email}</p>
          </div>
          <button className="px-5 py-2.5 bg-white text-gray-900 rounded-xl font-bold text-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
            Change Password
          </button>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center pb-24 z-20">
          {isEditing ? (
            <div className="flex gap-4">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-10 py-4 bg-black text-white rounded-full font-black hover:bg-gray-900 active:scale-95 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.2)] disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-10 py-4 bg-black text-white rounded-full font-black hover:bg-gray-900 active:scale-95 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
            >
              <Settings className="w-5 h-5" /> Edit Profile
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
