"use client";

import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";

export default function ClearButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleClear = async () => {
    setLoading(true);
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
      
    setLoading(false);
    setShowConfirm(false);
    
    if (error) {
      toast.error("Failed to clear notifications");
    } else {
      toast.success("Notifications cleared!");
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="p-2.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors active:scale-95 disabled:opacity-50"
        title="Clear all notifications"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-800">Clear All?</h3>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-slate-600 font-medium mb-6">Are you sure you want to permanently delete all your notifications? This cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleClear}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "Clearing..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
