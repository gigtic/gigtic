"use client";

import { useEffect, useRef } from "react";

interface AdsterraVerticalProps {
  className?: string;
}

export default function AdsterraVertical({ className = "" }: AdsterraVerticalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent duplicate injections on re-renders (Strict Mode)
    if (containerRef.current.querySelector('script')) {
      return;
    }

    // Configure Adsterra Options
    const confScript = document.createElement("script");
    confScript.type = "text/javascript";
    confScript.innerHTML = `
      atOptions = {
        'key' : 'b9452c493be6c1e919b72c7f7fb5e9e0',
        'format' : 'iframe',
        'height' : 600,
        'width' : 160,
        'params' : {}
      };
    `;
    
    // Inject Adsterra script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://www.highperformanceformat.com/b9452c493be6c1e919b72c7f7fb5e9e0/invoke.js";
    invokeScript.async = true;

    containerRef.current.appendChild(confScript);
    containerRef.current.appendChild(invokeScript);

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`w-[160px] h-[600px] flex items-center justify-center rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative ${className}`}>
      <div className="absolute top-2 right-2 text-[9px] font-black uppercase text-gray-400 tracking-wider z-10 bg-white/80 px-1 rounded">Ad</div>
      <div ref={containerRef} className="w-full h-full flex justify-center items-center">
        {/* Adsterra iframe will mount here */}
      </div>
    </div>
  );
}
