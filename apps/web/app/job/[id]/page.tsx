"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MapPin, Wallet, Clock, Zap, Star, MessageCircle, Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    if (id) loadJob();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data, error } = await supabase
      .from("jobs")
      .select(`*, users:requester_id (id, nickname, trust_score)`)
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setJob(data);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this gig? This action cannot be undone.")) return;
    
    setLoading(true);
    const { error } = await supabase
      .from("jobs")
      .update({ status: 'DELETED' })
      .eq("id", id);
      
    if (error) {
      console.error("Failed to delete gig:", error);
      alert("Could not delete the gig.");
      setLoading(false);
    } else {
      router.push("/explore");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]">
        <h2 className="text-2xl font-black text-gray-900">Gig not found</h2>
      </div>
    );
  }

  const isCreator = currentUser?.id === job.requester_id;

  // Extract coordinates if location is a POINT string
  let initialMapCenter: [number, number] | undefined = undefined;
  if (job.location && typeof job.location === 'string' && job.location.startsWith('POINT(')) {
    const coordsStr = job.location.replace('POINT(', '').replace(')', '').split(' ');
    if (coordsStr.length === 2) {
      initialMapCenter = [parseFloat(coordsStr[1]), parseFloat(coordsStr[0])]; // lat, lng
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] font-sans pb-32">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {job.is_urgent ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-black uppercase tracking-wide border border-red-100">
                    <Zap className="w-3.5 h-3.5 fill-current" /> SOS Emergency
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">
                    {job.category}
                  </span>
                )}
                <span className="text-xs font-bold text-gray-400">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
                {job.title}
              </h1>
              
              <div className="flex items-center gap-6">
                <Link href={`/user/${job.users?.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                    {job.users?.nickname?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.users?.nickname || "Anonymous"}</p>
                    <p className="text-xs font-bold text-orange-500 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> {job.users?.trust_score || 100} Trust Score
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-center min-w-[160px] hidden sm:block">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Budget</p>
              <p className="text-3xl font-black text-green-600">₹{job.budget_amount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {job.reference_images && job.reference_images.length > 0 && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" /> Reference Images
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {job.reference_images.map((img: string, idx: number) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                    <img src={img} alt="Reference" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {job.service_mode === 'Physical' && initialMapCenter && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Location
              </h2>
              <p className="text-sm font-medium text-gray-500 mb-4">
                Search Radius: {job.radius_km}km • Exchange: {job.exchange_preference}
              </p>
              <div className="rounded-xl overflow-hidden border border-gray-200 pointer-events-none">
                <MapPicker pincode="" onLocationSelect={() => {}} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sm:hidden">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Budget</p>
            <p className="text-3xl font-black text-green-600">₹{job.budget_amount}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-500">Service Mode</span>
              <span className="text-sm font-black text-gray-900">{job.service_mode}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-500">Status</span>
              <span className="text-sm font-black text-gray-900">{job.status}</span>
            </div>
            
            {!isCreator && job.status === 'OPEN' ? (
              <Link 
                href={`/chat?job=${job.id}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 mt-2 rounded-xl bg-black text-white font-bold hover:bg-gray-900 active:scale-95 transition-all shadow-md shadow-black/10"
              >
                <MessageCircle className="w-5 h-5" /> Message to Apply
              </Link>
            ) : isCreator ? (
              <div className="flex flex-col gap-3 mt-2">
                {job.status === 'OPEN' && (
                  <>
                    <Link 
                      href={`/create?edit=${job.id}`}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-black text-white font-bold hover:bg-gray-900 active:scale-95 transition-all shadow-md shadow-black/10"
                    >
                      Edit Gig
                    </Link>
                    <button 
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold hover:bg-red-100 active:scale-95 transition-all"
                    >
                      Delete Gig
                    </button>
                  </>
                )}
                <Link 
                  href={`/chat?job=${job.id}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 active:scale-95 transition-all"
                >
                  View Chats for Gig
                </Link>
              </div>
            ) : (
              <button disabled className="w-full flex items-center justify-center gap-2 px-6 py-4 mt-2 rounded-xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed">
                Gig No Longer Open
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
