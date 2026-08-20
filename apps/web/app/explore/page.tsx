"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, MapPin, Wallet, Clock, Zap, Star, Filter, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import AdsterraUnit from "@/components/AdsterraUnit";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  budget_amount: number;
  requester_id: string;
  service_mode: "Physical" | "Digital";
  is_urgent: boolean;
  status: string;
  created_at: string;
  users: {
    username: string;
    trust_score: number;
  };
}

export default function ExplorePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const supabase = createClient();

  useEffect(() => {
    fetchJobs();

    const channel = supabase.channel('public:jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          // Silently refresh jobs list on any change
          fetchJobs(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Use the matching engine RPC for geospatial filtering
      const { data, error } = await supabase.rpc('get_explore_feed', { p_user_id: user.id });
      
      if (error) {
        console.error("RPC Error:", error);
      }
      
      if (data && !error) {
        // Map the RPC data to match the UI's expected Job interface
        const formattedJobs = data.map((job: any) => ({
          ...job,
          requester_id: job.requester_id,
          users: {
            username: job.requester_username,
            trust_score: job.requester_trust_score
          }
        }));
        setJobs(formattedJobs);
      }
    } else {
      // Fallback if not logged in (though they should be)
      const { data, error } = await supabase
        .from("jobs")
        .select(`*, users:requester_id (username, trust_score)`)
        .eq("status", "OPEN")
        .order("is_urgent", { ascending: false })
        .order("created_at", { ascending: false });

      if (data && !error) {
        setJobs(data as any);
      }
    }
    if (!silent) setLoading(false);
  };

  const categories = ["All", "Physical", "Digital", "Programming", "Notes", "Design"];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || job.category.includes(activeCategory) || job.service_mode === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 font-sans selection:bg-indigo-600 selection:text-white pb-6 md:pb-32">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Explore Gigs</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Find tasks around campus and start earning.</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gigs (e.g. 'Move boxes')"
                className="block w-full pl-11 pr-4 py-2 md:py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors shrink-0">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 shrink-0"></div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-extrabold text-sm whitespace-nowrap transition-all duration-300  ${
                  activeCategory === cat ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200 border-2 border-indigo-500 transform scale-105" : "bg-white border-2 border-indigo-100 text-indigo-500 hover:bg-indigo-50 hover:border-indigo-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gray-300 mb-4" />
            <p className="text-slate-500 font-bold">Scanning campus...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No gigs found</h3>
            <p className="text-slate-500 font-medium mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5"
          >
            {filteredJobs.map((job, index) => (
              <React.Fragment key={job.id}>
                {/* Insert Adsterra Native Banner every 6 gigs */}
                {index === 5 && (
                  <motion.div variants={itemVariants} className="col-span-full py-2">
                    <AdsterraUnit />
                  </motion.div>
                )}
                <motion.div 
                  variants={itemVariants}
                  className="group bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col h-full overflow-hidden"
                >
                  <Link href={`/job/${job.id}`} className="flex-1 flex flex-col cursor-pointer">
                    {/* Badge Row */}
                    <div className="flex items-center justify-between mb-2">
                      {job.is_urgent ? (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-black uppercase tracking-wider border border-rose-100">
                          SOS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-bold border border-gray-100">
                          {job.category}
                        </span>
                      )}
                      {job.service_mode === 'Physical' ? (
                        <span className="text-[10px] text-gray-400" title="Physical">📍</span>
                      ) : (
                        <span className="text-[10px] text-gray-400" title="Digital">💻</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-[13px] md:text-sm font-bold text-gray-900 mb-1.5 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    
                    {/* Price */}
                    <div className="mt-auto mb-2">
                      <span className="text-sm font-black text-gray-900">₹{job.budget_amount}</span>
                    </div>
                  </Link>

                  {/* Footer User Row */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <Link href={`/user/${job.requester_id}`} className="flex items-center gap-2 overflow-hidden hover:opacity-80">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                        {job.users?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] md:text-xs font-bold text-gray-900 truncate">{job.users?.username || "Anon"}</p>
                        <p className="text-[9px] font-bold text-orange-500 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" /> {job.users?.trust_score || 100}
                        </p>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
