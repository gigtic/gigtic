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
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Gigs</h1>
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
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredJobs.map((job, index) => (
              <React.Fragment key={job.id}>
                {/* Insert Adsterra Native Banner every 6 gigs */}
                {index > 0 && index % 6 === 0 && (
                  <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-3">
                    <AdsterraUnit />
                  </motion.div>
                )}
                <motion.div 
                  variants={itemVariants}
                  className="group bg-white rounded-[32px] border-2 border-slate-100 p-6 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] hover:border-indigo-200 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full overflow-hidden relative"
                >
                
                {/* Badge Row */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  {/* Decorative background blob */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {job.is_urgent ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-black uppercase tracking-widest border-2 border-rose-200 shadow-sm">
                      <Zap className="w-3.5 h-3.5 fill-current" /> SOS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-extrabold border-2 border-blue-100 shadow-sm">
                      {job.category}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-400">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Title & Desc */}
                <Link href={`/job/${job.id}`}>
                  <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 relative z-10 tracking-tight">
                    {job.category === "Physical" ? "🛠️ " : job.category === "Digital" ? "💻 " : job.category === "Tutoring" ? "📚 " : "✨ "}{job.title}
                  </h3>
                </Link>
                <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-6 flex-1">
                  {job.description}
                </p>

                {/* Meta Row */}
                <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 mb-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <Wallet className="w-4 h-4 text-slate-400" />
                    <span>₹{job.budget_amount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{job.service_mode}</span>
                  </div>
                </div>

                {/* Footer User Row */}
                <div className="flex items-center justify-between mt-auto">
                  <Link href={`/user/${job.requester_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {job.users?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{job.users?.username || "Anonymous"}</p>
                      <p className="text-xs font-bold text-orange-500 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> {job.users?.trust_score || 100} Trust
                      </p>
                    </div>
                  </Link>
                  
                  <Link 
                    href={`/job/${job.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-900 font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    View Details
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
