"use client";

import { useEffect, useRef } from "react";

interface AdsterraUnitProps {
  formatId: string;
  className?: string;
}

export default function AdsterraUnit({ formatId, className = "" }: AdsterraUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent duplicate injections on re-renders (Strict Mode)
    if (containerRef.current.querySelector('script')) {
      return;
    }

    const confScript = document.createElement("script");
    confScript.type = "text/javascript";
    confScript.innerHTML = `
      atOptions = {
        'key' : '${formatId}',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `//www.highperformanceformat.com/${formatId}/invoke.js`;
    invokeScript.async = true;

    containerRef.current.appendChild(confScript);
    containerRef.current.appendChild(invokeScript);

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [formatId]);

  return (
    <div className={`w-full flex items-center justify-center my-6 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 p-4 relative ${className}`}>
      <div className="absolute top-2 right-3 text-[9px] font-black uppercase text-gray-400 tracking-wider">Sponsored</div>
      {/* 
        This is a safe boundary for the Adsterra ad to inject into. 
        When you get your actual IDs, replace the dummy ones in the props. 
      */}
      <div ref={containerRef} className="w-full flex justify-center items-center min-h-[50px] min-w-[300px]">
        {/* Adsterra script will mount here */}
      </div>
    </div>
  );
}
