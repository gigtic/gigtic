"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3 | 4;

export default function CreateJobWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  
  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isIncognito, setIsIncognito] = useState(false);
  const [isWomenOnly, setIsWomenOnly] = useState(false);
  
  const [serviceMode, setServiceMode] = useState<"Physical" | "Digital">("Physical");
  const [pincode, setPincode] = useState("");
  const [radius, setRadius] = useState("5");
  const [exchangePref, setExchangePref] = useState("DecideInChat");

  const [budgetType, setBudgetType] = useState("Fixed");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const [images, setImages] = useState<File[]>([]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 4) as Step);
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleSubmit = async () => {
    // Here we would integrate with Supabase
    alert("Job Posted Successfully!");
    router.push("/explore");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 2) {
        alert("Maximum 2 reference images allowed.");
        return;
      }
      setImages([...images, ...filesArray]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post a Job</h1>
        <p className="text-gray-500 mt-2">Step {step} of 4</p>
        <div className="w-full bg-gray-200 h-2 mt-4 rounded-full">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-3" placeholder="e.g. Need help with React project" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-3">
                <option value="">Select a category</option>
                <option value="Programming">Programming</option>
                <option value="Notes">Notes</option>
                <option value="Graphic Design">Graphic Design</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-3 h-32" placeholder="Describe what you need help with..."></textarea>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="incognito" checked={isIncognito} onChange={e => setIsIncognito(e.target.checked)} className="rounded text-blue-600" />
              <label htmlFor="incognito" className="text-sm text-gray-700">Post Anonymously</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="women" checked={isWomenOnly} onChange={e => setIsWomenOnly(e.target.checked)} className="rounded text-blue-600" />
              <label htmlFor="women" className="text-sm text-gray-700">Women Only</label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Location & Logistics</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Mode</label>
              <div className="flex space-x-4 mt-2">
                <button onClick={() => setServiceMode("Physical")} className={`flex-1 py-3 rounded-lg border ${serviceMode === 'Physical' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-gray-200'}`}>Physical Meetup</button>
                <button onClick={() => setServiceMode("Digital")} className={`flex-1 py-3 rounded-lg border ${serviceMode === 'Digital' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-gray-200'}`}>Digital / Remote</button>
              </div>
            </div>
            {serviceMode === "Physical" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-3" placeholder="6-digit pincode" maxLength={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Radius (km)</label>
                  <input type="number" value={radius} onChange={e => setRadius(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-3" placeholder="e.g. 5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exchange Preference</label>
                  <select value={exchangePref} onChange={e => setExchangePref(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-3">
                    <option value="DecideInChat">Decide in Chat</option>
                    <option value="RequesterCollects">I will collect</option>
                    <option value="ProviderDropsOff">Provider must drop off</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Budget & Urgency</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget Amount (INR)</label>
              <input type="number" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-3" placeholder="e.g. 500" />
            </div>
            <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-lg border border-red-100">
              <input type="checkbox" id="urgent" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="rounded text-red-600 focus:ring-red-500" />
              <label htmlFor="urgent" className="text-sm font-semibold text-red-700">🚨 Mark as SOS / Midnight Emergency</label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Reference Images</h2>
            <p className="text-sm text-gray-500">Upload up to 2 reference images (JPG, PNG only).</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
              <input type="file" multiple accept="image/jpeg, image/png" onChange={handleImageUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-medium hover:text-blue-700">
                Click to browse files
              </label>
            </div>
            {images.length > 0 && (
              <ul className="mt-4 space-y-2">
                {images.map((img, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <span>{img.name}</span>
                    <button onClick={() => setImages(images.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <button onClick={handlePrev} className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors">Back</button>
        ) : <div></div>}
        
        {step < 4 ? (
          <button onClick={handleNext} className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors">Next</button>
        ) : (
          <button onClick={handleSubmit} className="px-8 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors">Post Job</button>
        )}
      </div>
    </div>
  );
}
