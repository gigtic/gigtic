"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ShieldCheck, Star, MapPin, Loader2, ArrowRight } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 font-sans selection:bg-black selection:text-white pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profile</h1>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {profile && (
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-100 to-transparent rounded-bl-full -z-0 opacity-50"></div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white shadow-xl shadow-black/20 shrink-0">
                <span className="text-3xl font-black">{profile.nickname?.charAt(1).toUpperCase() || 'U'}</span>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-black text-gray-900 mb-1">{profile.nickname}</h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm font-medium text-gray-500 mb-6">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Default Radius: {profile.default_radius_km}km</span>
                  <span className="text-gray-300">•</span>
                  <span>{user.email}</span>
                </div>
                
                <div className="inline-flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl w-full sm:w-auto">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Trust Score</span>
                    <span className="block text-2xl font-black text-gray-900 leading-none">{profile.trust_score}<span className="text-gray-400 text-lg">/100</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Your Reviews</h3>
              <p className="text-sm font-medium text-gray-500 mb-4">See what others have said about working with you.</p>
              <div className="flex items-center text-sm font-bold text-black group-hover:underline">
                View reviews <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Settings</h3>
              <p className="text-sm font-medium text-gray-500 mb-4">Manage your location, radius, and preferences.</p>
              <div className="flex items-center text-sm font-bold text-black group-hover:underline">
                Manage settings <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
