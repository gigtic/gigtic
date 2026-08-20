"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle2, ChevronRight, MapPin, Wallet, Zap, Loader2, ImagePlus, X, Map } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

const parsePostgisPoint = (val: string) => {
  if (!val) return null;
  if (val.startsWith('POINT')) {
    const match = val.match(/POINT\(([^ ]+)\s+([^)]+)\)/);
    if (match) return [parseFloat(match[2]), parseFloat(match[1])] as [number, number];
  }
  try {
    const bytes = new Uint8Array(val.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const view = new DataView(bytes.buffer);
    const lon = view.getFloat64(9, true);
    const lat = view.getFloat64(17, true);
    return [lat, lon] as [number, number];
  } catch (e) {
    return null;
  }
};

type Step = 1 | 2 | 3 | 4;

export default function CreateJobWizard() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Physical");
  const [description, setDescription] = useState("");
  const [isIncognito, setIsIncognito] = useState(false);
  
  const [serviceMode, setServiceMode] = useState<"Physical" | "Digital">("Physical");
  const [pincode, setPincode] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState("5");
  const [exchangePref, setExchangePref] = useState("DecideInChat");

  const [budgetAmount, setBudgetAmount] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    // Client-side param extraction to avoid Suspense issues
    const params = new URLSearchParams(window.location.search);
    const edit = params.get('edit');
    if (edit) setEditId(edit);

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
      
      const { data } = await supabase.from('users').select('username').eq('id', user.id).single();
      if (!data || !data.username) {
        toast.error("Please set up your profile and username before posting a gig!");
        router.push("/profile");
        return;
      }

      if (edit) {
        const { data: job } = await supabase.from('jobs').select('*').eq('id', edit).single();
        if (job && job.requester_id === user.id) {
          if (job.status !== 'OPEN') {
            toast.error("This gig can no longer be edited because it is not open.");
            router.push(`/job/${job.id}`);
            return;
          }
          setTitle(job.title);
          setCategory(job.category);
          setDescription(job.description);
          setIsIncognito(job.is_incognito);
          setServiceMode(job.service_mode);
          if (job.radius_km) setRadius(job.radius_km.toString());
          if (job.exchange_preference) setExchangePref(job.exchange_preference);
          setBudgetAmount(job.budget_amount.toString());
          setIsUrgent(job.is_urgent);
          if (job.location) {
             const coords = parsePostgisPoint(job.location);
             if (coords) setCoordinates(coords);
          }
          if (job.reference_images) {
             setExistingImages(job.reference_images);
          }
        }
      }
    });
  }, [router, supabase]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 4) as Step);
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleSubmit = async () => {
    if (!userId) return;
    setLoading(true);
    
    try {
      // 1. Upload images if any
      const uploadedUrls: string[] = [];
      
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('gig-images')
          .upload(fileName, file);
          
        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('gig-images')
          .getPublicUrl(data.path);
          
        uploadedUrls.push(publicUrl);
      }

      // 2. Insert the job
      const jobData: any = {
        requester_id: userId,
        title,
        category,
        description,
        is_incognito: isIncognito,
        service_mode: serviceMode,
        radius_km: serviceMode === "Physical" ? parseInt(radius) : null,
        exchange_preference: serviceMode === "Physical" ? exchangePref : 'DecideInChat',
        budget_amount: parseFloat(budgetAmount),
        is_urgent: isUrgent,
        reference_images: (uploadedUrls.length > 0 || existingImages.length > 0) ? [...existingImages, ...uploadedUrls] : null,
        status: 'OPEN'
      };

      if (serviceMode === "Physical" && coordinates) {
        jobData.location = `POINT(${coordinates[1]} ${coordinates[0]})`;
      }

      if (editId) {
        const { error } = await supabase.from("jobs").update(jobData).eq('id', editId);
        if (error) throw error;
        router.push(`/job/${editId}`);
      } else {
        const { error } = await supabase.from("jobs").insert(jobData);
        if (error) throw error;
        router.push("/explore");
      }
    } catch (err: any) {
      toast.error("Error posting job: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = ({ num, label }: { num: number, label: string }) => {
    const isActive = step === num;
    const isCompleted = step > num;
    return (
      <div className="flex flex-col items-center relative z-10">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all duration-300 ${
          isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 shadow-lg shadow-black/20" : 
          isCompleted ? "bg-indigo-500 text-white" : "bg-white border-2 border-indigo-100/50 text-gray-400"
        }`}>
          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : num}
        </div>
        <span className={`text-xs mt-2 font-semibold ${isActive ? 'text-black' : 'text-gray-400'}`}>{label}</span>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 font-sans selection:bg-black selection:text-white pb-32">
      
      <div className="mb-12">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight text-center">
          {editId ? 'Edit Gig' : 'Post a Gig'}
        </h1>
        
        {/* Modern Stepper */}
        <div className="relative flex justify-between items-start mt-10 max-w-md mx-auto">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 -z-0">
            <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          </div>
          <StepIndicator num={1} label="Details" />
          <StepIndicator num={2} label="Logistics" />
          <StepIndicator num={3} label="Budget" />
          <StepIndicator num={4} label="Media" />
        </div>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-indigo-50/50 min-h-[400px]">
        <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">What do you need help with?</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Be clear and specific so providers know exactly what to do.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Gig Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="block w-full px-4 py-3.5 bg-gray-50/50 border border-indigo-100/50 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium" placeholder="e.g. Move 3 boxes out of dorm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="block w-full px-4 py-3.5 bg-gray-50/50 border border-indigo-100/50 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium appearance-none">
                  <option value="Physical">Physical Task / Delivery</option>
                  <option value="Programming">Programming & IT</option>
                  <option value="Notes">Notes & Study</option>
                  <option value="Graphic Design">Design</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="block w-full px-4 py-3.5 bg-gray-50/50 border border-indigo-100/50 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium h-32 resize-none" placeholder="Provide all the necessary details..."></textarea>
              </div>
              
              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center p-4 bg-gray-50 border-2 border-indigo-50/50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" checked={isIncognito} onChange={e => setIsIncognito(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                  <div className="ml-3">
                    <span className="block text-sm font-extrabold text-slate-800">Post Anonymously</span>
                    <span className="block text-xs font-medium text-slate-500">Hide your username on the public feed.</span>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
             <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Where is this happening?</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Set your location parameters to find the right helper.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">Service Mode</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setServiceMode("Physical")} className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${serviceMode === 'Physical' ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-200 transform scale-105' : 'bg-white border-indigo-100/50 text-gray-700 hover:border-gray-300'}`}>
                    <MapPin className={`w-6 h-6 mb-2 ${serviceMode === 'Physical' ? 'text-white' : 'text-gray-400'}`} />
                    <span className="block font-extrabold">Physical Meetup</span>
                    <span className={`text-xs mt-1 block font-medium ${serviceMode === 'Physical' ? 'text-gray-300' : 'text-slate-500'}`}>Requires meeting in person.</span>
                  </button>
                  <button onClick={() => setServiceMode("Digital")} className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${serviceMode === 'Digital' ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-200 transform scale-105' : 'bg-white border-indigo-100/50 text-gray-700 hover:border-gray-300'}`}>
                    <Wallet className={`w-6 h-6 mb-2 ${serviceMode === 'Digital' ? 'text-white' : 'text-gray-400'}`} />
                    <span className="block font-extrabold">Digital / Remote</span>
                    <span className={`text-xs mt-1 block font-medium ${serviceMode === 'Digital' ? 'text-gray-300' : 'text-slate-500'}`}>Can be done from anywhere.</span>
                  </button>
                </div>
              </div>

              {serviceMode === "Physical" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Your Pincode</label>
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value.replace(/[^0-9]/g, ''))} className="block w-full px-4 py-3.5 bg-gray-50/50 border border-indigo-100/50 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium" placeholder="6-digit pincode" maxLength={6} />
                  </div>
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Pinpoint Exact Location</label>
                    <p className="text-xs text-slate-500 mb-3 font-medium">Type a pincode to jump, or use "Detect Location", then tap the map to place the pin.</p>
                    <MapPicker 
                      pincode={pincode} 
                      initialCoordinates={coordinates}
                      onLocationSelect={(lat, lng) => setCoordinates([lat, lng])} 
                    />
                    {coordinates && (
                      <p className="text-xs text-green-600 font-extrabold mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Location securely captured
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Search Radius (km)</label>
                    <input type="number" value={radius} onChange={e => setRadius(e.target.value)} className="block w-full px-4 py-3.5 bg-gray-50/50 border border-indigo-100/50 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium" placeholder="e.g. 5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">Exchange Preference</label>
                    <select value={exchangePref} onChange={e => setExchangePref(e.target.value)} className="block w-full px-4 py-3.5 bg-gray-50/50 border border-indigo-100/50 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium appearance-none">
                      <option value="DecideInChat">Decide in Chat</option>
                      <option value="RequesterCollects">I will go to them</option>
                      <option value="ProviderDropsOff">They must come to me</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Set your budget</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">GigTic takes 0% commission. You pay 100% via cash or UPI.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Budget Amount (₹)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-extrabold">₹</span>
                  <input type="number" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} className="block w-full pl-10 pr-4 py-4 bg-gray-50/50 border border-indigo-100/50 rounded-2xl text-slate-800 text-lg font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all" placeholder="500" />
                </div>
              </div>
              
              <label className={`flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all ${isUrgent ? 'bg-red-50 border-red-500 shadow-lg shadow-red-500/10' : 'bg-white border-indigo-100/50 hover:border-gray-300'}`}>
                <div className="flex items-center h-6">
                  <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-red-600" />
                </div>
                <div className="ml-4 flex-1">
                  <span className={`block font-extrabold flex items-center gap-2 ${isUrgent ? 'text-red-700' : 'text-slate-800'}`}>
                    <Zap className="w-5 h-5" /> Mark as SOS Emergency
                  </span>
                  <span className={`block text-sm font-medium mt-1 ${isUrgent ? 'text-rose-500/80' : 'text-slate-500'}`}>Pins your job to the top of the feed for immediate attention.</span>
                </div>
              </label>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Add References</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Upload up to 2 images. These will be deleted after 7 days.</p>
            </div>
            
            <div className="border-2 border-dashed border-indigo-100/50 rounded-3xl p-8 flex flex-col items-center justify-center bg-gray-50/50">
              {(images.length > 0 || existingImages.length > 0) && (
                <div className="w-full grid grid-cols-2 gap-4 mb-8">
                  {existingImages.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative group rounded-2xl overflow-hidden border border-indigo-100/50 aspect-square bg-gray-100">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setExistingImages(imgs => imgs.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {images.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative group rounded-2xl overflow-hidden border border-indigo-100/50 aspect-square bg-gray-100">
                      <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setImages(imgs => imgs.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {(images.length + existingImages.length) < 2 && (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full">
                  <div className="w-16 h-16 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-indigo-50/50 rounded-full flex items-center justify-center mb-4 text-black hover:scale-105 transition-transform">
                    <ImagePlus className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 mb-1">Click to add photos</h3>
                  <p className="text-sm text-slate-500 font-medium text-center">Upload up to {2 - (images.length + existingImages.length)} more {(2 - (images.length + existingImages.length)) === 1 ? 'image' : 'images'}</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setImages(prev => [...prev, e.target.files![0]]);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button 
          onClick={handlePrev} 
          disabled={step === 1}
          className="px-6 py-4 rounded-2xl font-extrabold text-slate-500 hover:text-black hover:bg-white disabled:opacity-0 transition-all"
        >
          Back
        </button>
        
        {step < 4 ? (
          <button 
            onClick={handleNext} 
            disabled={step === 2 && serviceMode === "Physical" && !coordinates}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-extrabold hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-black/10 disabled:opacity-50 disabled:active:scale-100"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-extrabold hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-black/20 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editId ? "Update Gig" : "Publish Gig")}
          </button>
        )}
      </div>
    </div>
  );
}
