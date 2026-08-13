"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Briefcase, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function MyGigsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posted" | "accepted">("posted");
  const [gigs, setGigs] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchGigs();
  }, [activeTab]);

  const fetchGigs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const column = activeTab === "posted" ? "requester_id" : "provider_id";
    
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq(column, user.id)
      .order("created_at", { ascending: false });

    setGigs(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Gigs</h1>
            <p className="text-gray-500 font-medium mt-1">Track the jobs you're involved in.</p>
          </div>
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-200 pb-px">
          <button 
            onClick={() => setActiveTab("posted")}
            className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${
              activeTab === "posted" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Gigs I Posted
          </button>
          <button 
            onClick={() => setActiveTab("accepted")}
            className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${
              activeTab === "accepted" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Gigs I Accepted
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-1">No {activeTab} gigs yet.</h3>
            <p className="text-sm text-gray-500 font-medium">Head over to the Explore feed to find opportunities!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {gigs.map(gig => (
              <Link 
                key={gig.id} 
                href={`/chat?job=${gig.id}`}
                className="block bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        gig.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        gig.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {gig.status.replace("_", " ")}
                      </span>
                      <span className="text-sm font-bold text-gray-400">₹{gig.budget_amount}</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">{gig.title}</h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
