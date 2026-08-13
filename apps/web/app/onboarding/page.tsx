"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowRight, UserCircle, MapPin, Loader2, Phone, Briefcase, Hash, User } from "lucide-react";

export default function OnboardingPage() {
  const [nickname, setNickname] = useState("");
  const [realName, setRealName] = useState("");
  const [age, setAge] = useState("");
  const [status, setStatus] = useState("Unspecified");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [pincode, setPincode] = useState("");
  const [gender, setGender] = useState("Unspecified");
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase.from("users").select("id").eq("id", user.id).single();
      if (data) {
        router.push("/explore");
      }
      setIsChecking(false);
    };
    checkUser();
  }, [router, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const formattedNickname = nickname.startsWith('@') ? nickname : `@${nickname}`;
    
    const { error } = await supabase.from("users").insert({
      id: user.id,
      real_name: realName,
      nickname: formattedNickname,
      age: parseInt(age) || null,
      status: status,
      phone_number: `${countryCode} ${phoneNumber}`.trim(),
      gender: gender,
      default_radius_km: 5
    });

    if (error) {
      alert("Error saving profile: " + error.message);
      setLoading(false);
      return;
    }

    router.push("/explore");
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-md space-y-10 bg-white p-10 sm:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
        
        <div className="space-y-3">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 mb-6">
            <UserCircle className="text-white w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Create Profile
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            UniGig is strictly privacy-first. Choose a public nickname to represent you on campus.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSave}>
          <div className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">Real Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  className="block w-full pl-11 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all duration-200 sm:text-sm font-medium"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">Public Nickname</label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all duration-200 sm:text-sm font-medium"
                  placeholder="CoolStudent99"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">Mobile Number</label>
              <div className="flex bg-gray-50/50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all duration-200 overflow-hidden">
                <div className="flex items-center pl-4 text-gray-400">
                  <Phone className="h-5 w-5" />
                </div>
                <select 
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-transparent pl-3 pr-2 py-3.5 text-gray-900 font-medium border-r border-gray-200 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+971">+971 (AE)</option>
                </select>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9\s]/g, ''))}
                  className="block w-full px-3 py-3.5 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none sm:text-sm font-medium"
                  placeholder="99999 00000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-900">Age</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Hash className="h-5 w-5" />
                  </div>
                  <input
                    type="number"
                    min="16"
                    max="100"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="block w-full pl-11 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all duration-200 sm:text-sm font-medium"
                    placeholder="18"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-900">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all duration-200 sm:text-sm font-medium appearance-none"
                >
                  <option value="Unspecified">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all duration-200 sm:text-sm font-medium appearance-none"
              >
                <option value="Unspecified">Select Status</option>
                <option value="Student">Student</option>
                <option value="Worker">Worker</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-900">Campus Pincode</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all duration-200 sm:text-sm font-medium tracking-widest"
                  placeholder="110001"
                />
              </div>
              <p className="text-xs text-gray-500 pt-1">Used anonymously to match you with nearby gigs.</p>
            </div>

          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || nickname.length < 3 || pincode.length !== 6 || !realName || !age || !phoneNumber}
              className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-black hover:bg-gray-900 hover:shadow-xl hover:shadow-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Start Earning
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
