"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdBlockDetector() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Create a bait element that ad blockers aggressively target
    const bait = document.createElement('div');
    bait.className = 'ad-banner adsbox doubleclick ad-placement';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    bait.style.height = '10px';
    bait.innerHTML = '&nbsp;';
    document.body.appendChild(bait);

    // Give the adblocker a split second to apply its CSS rules
    const timer = setTimeout(() => {
      const isBlocked = 
        bait.offsetHeight === 0 || 
        window.getComputedStyle(bait).display === 'none' ||
        window.getComputedStyle(bait).visibility === 'hidden' ||
        bait.offsetParent === null;
      
      setAdBlockDetected(isBlocked);
      
      if (document.body.contains(bait)) {
        document.body.removeChild(bait);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (document.body.contains(bait)) {
        document.body.removeChild(bait);
      }
    };
  }, [pathname]); // Re-run check on navigation occasionally

  if (!adBlockDetected || dismissed) return null;
  
  // Don't show on pages where we don't even show ads
  if (pathname === "/" || pathname === "/login" || pathname === "/about") return null;

  return (
    <div className="fixed top-[84px] left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4 rounded-2xl shadow-xl flex gap-3 items-start border border-red-400/30">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-extrabold text-sm tracking-wide uppercase mb-1">Ad Blocker Detected</h3>
          <p className="text-xs text-red-50 font-medium leading-relaxed">
            Please consider disabling your ad blocker for UniGig. Our platform is 100% free for students, and ads are the only way we keep the servers running! ❤️
          </p>
        </div>
        <button 
          onClick={() => setDismissed(true)} 
          className="p-1.5 bg-black/10 hover:bg-black/20 rounded-xl transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
