"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, MapPin, Wallet, Clock, Zap, Star, Filter, MessageCircle } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  budget_amount: number;
  service_mode: "Physical" | "Digital";
  is_urgent: boolean;
  status: string;
  created_at: string;
  users: {
    nickname: string;
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
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    // Note: In a fully configured DB, this would call the 'get_explore_feed' RPC for geospatial math.
    // For now, we fallback to a standard query to ensure it always loads.
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        users:requester_id (
          nickname,
          trust_score
        )
      `)
      .eq("status", "OPEN")
      .order("is_urgent", { ascending: false })
      .order("created_at", { ascending: false });

    if (data && !error) {
      setJobs(data as any);
    }
    setLoading(false);
  };

  const categories = ["All", "Physical", "Digital", "Programming", "Notes", "Design"];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || job.category.includes(activeCategory) || job.service_mode === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] font-sans selection:bg-black selection:text-white pb-32">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Explore Gigs</h1>
              <p className="text-gray-500 font-medium text-sm mt-1">Find tasks around campus and start earning.</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gigs (e.g. 'Move boxes')"
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors shrink-0">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 shrink-0"></div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  activeCategory === cat 
                    ? "bg-black text-white shadow-md shadow-black/20" 
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
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
            <p className="text-gray-500 font-bold">Scanning campus...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No gigs found</h3>
            <p className="text-gray-500 font-medium mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                
                {/* Badge Row */}
                <div className="flex items-center justify-between mb-4">
                  {job.is_urgent ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-black uppercase tracking-wide border border-red-100">
                      <Zap className="w-3.5 h-3.5 fill-current" /> SOS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">
                      {job.category}
                    </span>
                  )}
                  <span className="text-xs font-bold text-gray-400">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium line-clamp-3 mb-6 flex-1">
                  {job.description}
                </p>

                {/* Meta Row */}
                <div className="flex items-center gap-4 text-sm font-semibold text-gray-700 mb-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    <span>₹{job.budget_amount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{job.service_mode}</span>
                  </div>
                </div>

                {/* Footer User Row */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {job.users?.nickname?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{job.users?.nickname || "Anonymous"}</p>
                      <p className="text-xs font-bold text-orange-500 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> {job.users?.trust_score || 100} Trust
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/chat?job=${job.id}`}
                    className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md shadow-black/20"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
