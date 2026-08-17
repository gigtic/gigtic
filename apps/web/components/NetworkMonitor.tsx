"use client";

import { useEffect, useState } from "react";
import { WifiOff, Activity, RefreshCw } from "lucide-react";

export default function NetworkMonitor() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [dismissSlow, setDismissSlow] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Network Information API for connection speed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    const checkConnectionSpeed = () => {
      if (connection && connection.effectiveType) {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setIsSlow(true);
        } else {
          setIsSlow(false);
        }
      }
    };

    if (connection) {
      checkConnectionSpeed();
      connection.addEventListener('change', checkConnectionSpeed);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener('change', checkConnectionSpeed);
      }
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl animate-in fade-in duration-300 px-6 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <WifiOff className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">You're Offline</h1>
        <p className="text-gray-500 max-w-sm mb-8 text-lg leading-relaxed">
          It looks like you've lost your internet connection. Please check your network and try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  if (isSlow && !dismissSlow) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[998] bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between shadow-md animate-in slide-in-from-top-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 animate-pulse" />
          <p className="text-sm font-bold">Slow connection detected. The app may take longer to load.</p>
        </div>
        <button 
          onClick={() => setDismissSlow(true)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return null;
}
