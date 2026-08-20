"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MapPin, Wallet, Clock, Zap, Star, MessageCircle, Loader2, ArrowLeft, Image as ImageIcon, X, Lock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdsterraUnit from "@/components/AdsterraUnit";
import PremiumUnlockButton from "@/components/PremiumUnlockButton";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isContactUnlocked, setIsContactUnlocked] = useState(false);
  
  // Zoom & Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
    resetZoom();
  };

  const supabase = createClient();

  useEffect(() => {
    if (id) {
      loadJob();
      
      // Load unlock status from local storage
      const savedUnlocks = localStorage.getItem('gigtic_unlocked_contacts');
      if (savedUnlocks) {
        try {
          const unlockedIds = JSON.parse(savedUnlocks);
          if (unlockedIds.includes(id)) {
            setIsContactUnlocked(true);
          }
        } catch (e) {}
      }
    }
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data, error } = await supabase
      .from("jobs")
      .select(`*, users:requester_id (id, username, trust_score, phone_number, email, is_contact_masked)`)
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setJob(data);
    }
    setLoading(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from("jobs")
      .update({ status: 'DELETED' })
      .eq("id", id);
      
    if (error) {
      console.error("Failed to delete gig:", error);
      toast.error("Could not delete the gig.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    } else {
      router.push("/explore");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-black text-slate-800">Gig not found</h2>
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
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 font-sans pb-6 md:pb-32">
      <div className="bg-white border-b border-indigo-100/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-extrabold text-slate-500 hover:text-black transition-colors mb-6">
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
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-extrabold border border-indigo-100/50">
                    {job.category}
                  </span>
                )}
                <span className="text-xs font-extrabold text-gray-400">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight mb-4">
                {job.title}
              </h1>
              
              <div className="flex items-center gap-6">
                <Link href={`/user/${job.users?.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-extrabold text-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:scale-105 transition-transform">
                    {job.users?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{job.users?.username || "Anonymous"}</p>
                    <p className="text-xs font-extrabold text-orange-500 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> {job.users?.trust_score || 100} Trust Score
                    </p>
                  </div>
                </Link>
              </div>

              {!isCreator && (
                <div className="mt-8 max-w-sm">
                  {job.users?.is_contact_masked ? (
                    <div className="bg-gray-100 p-5 rounded-2xl border border-indigo-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <h4 className="font-extrabold text-gray-700 mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Contact Info Hidden
                      </h4>
                      <p className="text-sm text-slate-500">
                        This user has chosen to keep their contact information private. Please use the chat feature to communicate.
                      </p>
                    </div>
                  ) : isContactUnlocked ? (
                    <div className="bg-green-50 p-5 rounded-2xl border border-green-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <h4 className="font-extrabold text-green-900 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current" /> Contact Info Unlocked
                      </h4>
                      <div className="space-y-1.5 text-sm text-green-800">
                        <p className="flex items-center gap-2"><span className="opacity-70">Phone:</span> <strong>{job.users?.phone_number || '+91 98****3210'}</strong></p>
                        <p className="flex items-center gap-2"><span className="opacity-70">Email:</span> <strong>{job.users?.email || `${job.users?.username?.toLowerCase() || 'user'}@university.edu`}</strong></p>
                      </div>
                    </div>
                  ) : (
                    <PremiumUnlockButton 
                      title="Reveal Contact Details"
                      description="View this user's direct phone number and university email to bypass the chat."
                      buttonText="Unlock Info"
                      onUnlock={() => {
                        setIsContactUnlocked(true);
                        try {
                          const savedUnlocks = localStorage.getItem('gigtic_unlocked_contacts');
                          const unlockedIds = savedUnlocks ? JSON.parse(savedUnlocks) : [];
                          if (!unlockedIds.includes(id)) {
                            unlockedIds.push(id);
                            localStorage.setItem('gigtic_unlocked_contacts', JSON.stringify(unlockedIds));
                          }
                        } catch (e) {}
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-indigo-50/50 text-center min-w-[160px] hidden sm:block">
              <p className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-1">Budget</p>
              <p className="text-3xl font-black text-green-600">₹{job.budget_amount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 mb-4">Description</h2>
            <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {job.reference_images && job.reference_images.length > 0 && (
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" /> Reference Images
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {job.reference_images.map((img: string, idx: number) => (
                  <div 
                    key={idx} 
                    className="rounded-2xl overflow-hidden border border-indigo-100/50 aspect-video bg-gray-100 cursor-pointer group relative"
                    onClick={() => {
                      setFullScreenImage(img);
                      resetZoom();
                    }}
                  >
                    <img src={img} alt="Reference" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}


          {job.service_mode === 'Physical' && initialMapCenter && (
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Location
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-4">
                Search Radius: {job.radius_km}km • Exchange: {job.exchange_preference}
              </p>
              <div className="rounded-2xl overflow-hidden border border-indigo-100/50 pointer-events-none">
                <MapPicker pincode="" onLocationSelect={() => {}} />
              </div>
            </div>
          )}
          
          {/* Adsterra Native Banner at the bottom of the content */}
          <div className="pt-4">
            <AdsterraUnit />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm sm:hidden">
            <p className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-1">Budget</p>
            <p className="text-3xl font-black text-green-600">₹{job.budget_amount}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-sm font-extrabold text-slate-500">Service Mode</span>
              <span className="text-sm font-black text-slate-800">{job.service_mode}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-sm font-extrabold text-slate-500">Status</span>
              <span className="text-sm font-black text-slate-800">{job.status}</span>
            </div>
            
            {!isCreator && job.status === 'OPEN' ? (
              <Link 
                href={`/chat?job=${job.id}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 mt-2 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-extrabold hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-black/10"
              >
                <MessageCircle className="w-5 h-5" /> Message to Apply
              </Link>
            ) : isCreator ? (
              <div className="flex flex-col gap-3 mt-2">
                <Link 
                  href={`/chat?job=${job.id}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gray-100 text-slate-800 font-extrabold hover:bg-gray-200 active:scale-95 transition-all"
                >
                  View Chats for Gig
                </Link>
                {job.status === 'OPEN' && (
                  <>
                    <Link 
                      href={`/create?edit=${job.id}`}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-extrabold hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-black/10"
                    >
                      Edit Gig
                    </Link>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-50 text-rose-500 border border-red-100 font-extrabold hover:bg-red-100 active:scale-95 transition-all"
                    >
                      Delete Gig
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button disabled className="w-full flex items-center justify-center gap-2 px-6 py-4 mt-2 rounded-2xl bg-gray-100 text-gray-400 font-extrabold cursor-not-allowed">
                Gig No Longer Open
              </button>
            )}
          </div>
        </div>
      </div>

      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200 overflow-hidden"
          onWheel={(e) => {
            e.preventDefault();
            setZoom((prev) => Math.min(Math.max(0.5, prev - e.deltaY * 0.005), 5));
          }}
          onPointerMove={(e) => {
            if (!isDragging) return;
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
          }}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
        >
          <div 
            className="absolute inset-0 z-0" 
            onClick={closeFullScreen}
          />
          
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
            onClick={closeFullScreen}
          >
            <X className="w-6 h-6" />
          </button>

          {zoom !== 1 && (
            <div className="absolute top-6 left-6 text-white bg-black/50 px-3 py-1 rounded-full text-sm font-extrabold backdrop-blur-sm z-50 pointer-events-none">
              {Math.round(zoom * 100)}%
            </div>
          )}
          
          <img 
            src={fullScreenImage} 
            alt="Full screen reference" 
            draggable={false}
            className={`max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl relative z-10 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
              setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            }}
            onClick={(e) => e.stopPropagation()} 
            onDoubleClick={() => resetZoom()}
          />
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-800 mb-2">Delete Gig?</h3>
            <p className="text-slate-500 font-medium text-sm mb-8">
              Are you sure you want to delete this gig? This action cannot be undone and will permanently remove it from the platform.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-2xl font-extrabold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-2xl font-extrabold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-200 active:scale-95 transition-all shadow-md shadow-red-600/20 flex justify-center disabled:opacity-70 disabled:active:scale-100"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
