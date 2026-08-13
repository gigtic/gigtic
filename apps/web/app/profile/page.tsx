"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User, MapPin, Shield, LogOut, Settings, Camera, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    real_name: "",
    nickname: "",
    bio: ""
  });
  
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
      setProfile({
        real_name: data.real_name || "",
        nickname: data.nickname || "",
        bio: data.bio || ""
      });
    } else if (error && error.code === 'PGRST116') {
      // Profile doesn't exist yet, that's fine, we will create on save
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      });

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
