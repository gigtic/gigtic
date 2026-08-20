"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ArrowRight, Plus, Search, MessageSquare, Star, Loader2, Clock } from "lucide-react";

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
          .select("username, trust_score")
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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    );
  }

  // --- LOGGED IN DASHBOARD ---
  if (!user) return null; // Middleware will handle redirect

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 font-sans pb-6 md:pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            Welcome back, {userData?.username || "Student"}!
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-orange-500 fill-current" /> 
            Trust Score: <span className="font-extrabold text-slate-800">{userData?.trust_score || 100}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/create" className="group bg-indigo-600 text-white shadow-lg shadow-indigo-200 p-6 rounded-xl hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-600/20 flex flex-col h-full">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold mb-1">Post a Gig</h3>
            <p className="text-white/70 font-medium text-sm">Need something done? Create a listing instantly.</p>
          </Link>
          
          <Link href="/explore" className="group bg-white border border-gray-200 p-6 rounded-xl hover:border-gray-400 active:scale-95 transition-all shadow-sm flex flex-col h-full">
            <div className="w-12 h-12 bg-gray-100 text-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-1">Explore Gigs</h3>
            <p className="text-slate-500 font-medium text-sm">Find tasks around campus and start earning.</p>
          </Link>
          
          <Link href="/chat" className="group bg-white border border-gray-200 p-6 rounded-xl hover:border-gray-400 active:scale-95 transition-all shadow-sm flex flex-col h-full">
            <div className="w-12 h-12 bg-gray-100 text-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-1">Global Inbox</h3>
            <p className="text-slate-500 font-medium text-sm">Check your messages and gig negotiations.</p>
          </Link>
        </div>

        {/* Active Gigs Dashboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Your Active Gigs
            </h2>
            <Link href="/gigs" className="text-sm font-extrabold text-slate-500 hover:text-black transition-colors">View All →</Link>
          </div>
          
          {activeJobs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 font-medium mb-4">You have no active gigs right now.</p>
              <Link href="/explore" className="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-slate-800 font-extrabold rounded-2xl transition-colors">
                Find a Gig
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.map(job => (
                <Link key={job.id} href={`/job/${job.id}`} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-indigo-100/50 group">
                  <div>
                    <h3 className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                    <p className="text-sm font-medium text-slate-500">{job.status} • ₹{job.budget_amount}</p>
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
