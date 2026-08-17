"use client";

import { useEffect, useState } from "react";
import { Heart, ShieldAlert, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdBlockDetector() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let isBlocked = false;

    // Method 1: Network Level Detection (Catches Brave Shields & strict uBlock Origin)
    const checkNetworkBlock = async () => {
      try {
        // Try fetching a well-known ad script URL
        await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        });
      } catch (error) {
        // If the fetch fails completely (network error), an adblocker intercepted it
        isBlocked = true;
        setAdBlockDetected(true);
      }
    };

    // Method 2: Cosmetic Level Detection (Catches standard adblockers)
    const checkCosmeticBlock = () => {
      if (isBlocked) return; // Already detected
      
      const bait = document.createElement('div');
      bait.className = 'ad-banner adsbox doubleclick ad-placement';
      bait.style.position = 'absolute';
      bait.style.left = '-9999px';
      bait.style.height = '10px';
      bait.innerHTML = '&nbsp;';
      document.body.appendChild(bait);

      setTimeout(() => {
        const visuallyBlocked = 
          bait.offsetHeight === 0 || 
          window.getComputedStyle(bait).display === 'none' ||
          window.getComputedStyle(bait).visibility === 'hidden';
        
        if (visuallyBlocked) {
          setAdBlockDetected(true);
        }
        
        if (document.body.contains(bait)) {
          document.body.removeChild(bait);
        }
      }, 500);
    };

    checkNetworkBlock().then(() => checkCosmeticBlock());

  }, [pathname]);

  if (!adBlockDetected || dismissed) return null;
  
  // Don't show on pages where we don't show ads
  if (pathname === "/" || pathname === "/login" || pathname === "/about") return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">
            Ad Blocker Detected
          </h2>
          
          <p className="text-gray-500 font-medium mb-6 leading-relaxed">
            We noticed you might be using an Ad Blocker or a privacy browser. GigTic is built completely <strong className="text-black">free for students</strong>, and ads are the only way we keep our servers running!
          </p>

          <div className="bg-gray-50 p-4 rounded-2xl w-full text-left mb-6 border border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 mb-1 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              How you can help:
            </h3>
            <ul className="text-sm text-gray-500 space-y-1.5 mt-2 ml-6 list-disc">
              <li>Pause your Ad Blocker on this site</li>
              <li>Turn off your VPN or privacy proxies</li>
              <li>Disable "Brave Shields" if using Brave</li>
            </ul>
          </div>

          <button 
            onClick={() => setDismissed(true)}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95"
          >
            I understand, I'll turn it off
          </button>
        </div>
      </div>
    </div>
  );
}
