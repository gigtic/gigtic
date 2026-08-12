"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Search, MapPin, Navigation, Clock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function ExploreFeed() {
  const supabase = createClient();
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserId(user.id);

    const { data, error } = await supabase.rpc("get_explore_feed", { p_user_id: user.id });
    
    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const handleApply = async (jobId: string) => {
    if (!userId) return;
    const { error } = await supabase.from("jobs")
      .update({ provider_id: userId, status: 'ASSIGNED' })
      .eq("id", jobId);
      
    if (error) {
      alert("Error accepting job: " + error.message);
    } else {
      router.push('/chat');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === "Urgent") return job.is_urgent;
    if (filter === "Digital") return job.service_mode === "Digital";
    if (filter === "Nearby") return job.service_mode === "Physical" && job.distance_km < 3;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white pb-32">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Explore Gigs</h1>
          <p className="text-gray-500 font-medium">Discover students near you who need your help.</p>
        </div>
      </div>

      {/* Modern Filter Pills */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {["All", "Nearby", "Digital", "Urgent"].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              filter === f 
                ? "bg-black text-white shadow-lg shadow-black/10" 
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {f === "Urgent" && "🚨 "}{f}
          </button>
        ))}
      </div>

      {/* Feed Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-gray-500 font-medium">Running PostGIS Matching Engine...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No gigs found</h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto">There are no jobs matching your current radius and filters right now. Try expanding your search.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredJobs.map(job => (
            <div key={job.id} className="group bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-200 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              
              <div className="flex-1 space-y-4">
                
                {/* Badges Row */}
                <div className="flex items-center gap-2">
                  {job.is_urgent && (
                    <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> URGENT
                    </span>
                  )}
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    {job.category}
                  </span>
                </div>
                
                {/* Title & Desc */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-black transition-colors">{job.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 font-medium">{job.description}</p>
                </div>
                
                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">{job.requester_nickname.charAt(1).toUpperCase()}</span>
                    </div>
                    {job.requester_nickname}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                    <ShieldCheck className="w-4 h-4" />
                    {job.requester_trust_score} Trust
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-gray-500">
                    {job.service_mode === 'Physical' ? (
                      <><Navigation className="w-4 h-4" /> {job.distance_km.toFixed(1)} km away</>
                    ) : (
                      <><MapPin className="w-4 h-4" /> Anywhere (Digital)</>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:min-w-[140px] pt-4 md:pt-0 border-t border-gray-100 md:border-t-0">
                <span className="text-2xl font-black text-gray-900 tracking-tight">₹{job.budget_amount}</span>
                <button 
                  onClick={() => handleApply(job.id)}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-900 active:scale-95 transition-all shadow-md shadow-black/10"
                >
                  Accept Job
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
