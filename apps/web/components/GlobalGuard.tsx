"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ShieldAlert } from "lucide-react";

export default function GlobalGuard({ children }: { children: React.ReactNode }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase.from('users').select('account_status, status_reason').eq('id', user.id).single();
        if (userData && (userData.account_status === 'SUSPENDED' || userData.account_status === 'BANNED' || userData.account_status === 'DELETED')) {
      setReason(userData.status_reason);
          setIsBlocked(true);
          setStatus(userData.account_status.toLowerCase());
        }
      }
    };
    checkStatus();
  }, [supabase]);

  if (isBlocked) {
    return (
      <div className="bg-slate-100 flex items-center justify-center min-h-screen w-full fixed inset-0 z-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full mx-4 text-center border border-red-100">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900 mb-2">Account Disabled</h1>
          <p className="text-slate-600 mb-4 font-medium">Your account has been strictly {status} by the GigTic Admin team for violating community guidelines.</p>
            {reason && (
              <div className="bg-red-50 p-4 rounded-xl mb-8 border border-red-100 text-red-800 text-left">
                <span className="font-bold">Reason:</span> {reason}
              </div>
            )}
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }} 
            className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-2xl font-extrabold">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
