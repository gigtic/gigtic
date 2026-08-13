"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ArrowRight, ShieldCheck, MapPin, Wallet, Plus, Search, MessageSquare, Star, Loader2, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch profile data
        const { data: profile } = await supabase
          .from("users")
          .select("nickname, trust_score")
          .eq("id", user.id)
          .single();
        setUserData(profile);
        
        // Fetch their active jobs
        const { data: jobs } = await supabase
          .from("jobs")
          .select("*")
          .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
          .neq("status", "COMPLETED")
          .neq("status", "DELETED")
          .order("created_at", { ascending: false })
          .limit(3);
        
        setActiveJobs(jobs || []);
      }
      setLoading(false);
    };
    fetchUserAndData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    );
  }

  // --- LOGGED IN DASHBOARD ---
  if (user) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] font-sans pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Welcome back, {userData?.nickname || "Student"}!
            </h1>
            <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500 fill-current" /> 
              Trust Score: <span className="font-bold text-gray-900">{userData?.trust_score || 100}</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href="/create" className="group bg-black text-white p-6 rounded-3xl hover:bg-gray-900 active:scale-95 transition-all shadow-xl shadow-black/10 flex flex-col h-full">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-1">Post a Gig</h3>
              <p className="text-white/70 font-medium text-sm">Need something done? Create a listing instantly.</p>
            </Link>
            
            <Link href="/explore" className="group bg-white border border-gray-200 p-6 rounded-3xl hover:border-black active:scale-95 transition-all shadow-sm flex flex-col h-full">
              <div className="w-12 h-12 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Explore Gigs</h3>
              <p className="text-gray-500 font-medium text-sm">Find tasks around campus and start earning.</p>
            </Link>
            
            <Link href="/chat" className="group bg-white border border-gray-200 p-6 rounded-3xl hover:border-black active:scale-95 transition-all shadow-sm flex flex-col h-full">
              <div className="w-12 h-12 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Global Inbox</h3>
              <p className="text-gray-500 font-medium text-sm">Check your messages and gig negotiations.</p>
            </Link>
          </div>

          {/* Active Gigs Dashboard */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Your Active Gigs
              </h2>
              <Link href="/gigs" className="text-sm font-bold text-gray-500 hover:text-black transition-colors">View All →</Link>
            </div>
            
            {activeJobs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 font-medium mb-4">You have no active gigs right now.</p>
                <Link href="/explore" className="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors">
                  Find a Gig
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeJobs.map(job => (
                  <Link key={job.id} href={`/job/${job.id}`} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 group">
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <p className="text-sm font-medium text-gray-500">{job.status} • ₹{job.budget_amount}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- LOGGED OUT MARKETING PAGE ---
  return (
    <div className="font-sans selection:bg-black selection:text-white">
      
      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8 overflow-hidden min-h-[calc(100vh-64px)] flex flex-col justify-center items-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-sm font-bold text-gray-900 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            UniGig 2.0 is Live on Campus
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-gray-900 mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-5">
            The Hyperlocal <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">Student Gig Network.</span>
          </h1>
          
          <p className="text-lg sm:text-xl leading-relaxed text-gray-500 font-medium mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6">
            Need help moving out? Stuck on a coding assignment? Or just want to earn extra cash? Connect with verified students within your exact radius. Zero commission.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8">
            <Link 
              href="/explore" 
              className="w-full sm:w-auto group relative flex justify-center items-center gap-2 py-4 px-8 rounded-full text-white bg-black hover:bg-gray-900 font-bold hover:shadow-2xl hover:shadow-black/20 focus:outline-none transition-all duration-300 active:scale-95 text-lg"
            >
              Start Earning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/create" 
              className="w-full sm:w-auto flex justify-center items-center gap-2 py-4 px-8 rounded-full text-gray-900 bg-white border-2 border-gray-200 hover:border-black font-bold focus:outline-none transition-all duration-300 active:scale-95 text-lg"
            >
              Post a Gig
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-[#FAFAFA] border border-gray-100 p-10 rounded-3xl cursor-default"
            >
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Hyperlocal Matching</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Our PostGIS matching engine ensures you only see physical gigs that are exactly within your preferred walking or driving radius.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-[#FAFAFA] border border-gray-100 p-10 rounded-3xl cursor-default"
            >
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Zero Commission</h3>
              <p className="text-gray-500 font-medium leading-relaxed">We don't mediate payments. Complete the job and get paid 100% of your earnings directly via Cash or UPI using our 2-step handshake.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-[#FAFAFA] border border-gray-100 p-10 rounded-3xl cursor-default"
            >
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Your real name and phone number are hidden. Plus, all chats and job details are permanently erased 7 days after completion.</p>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
