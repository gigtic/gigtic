"use client";

import { useEffect, useRef } from "react";

interface AdsterraUnitProps {
  className?: string;
}

export default function AdsterraUnit({ className = "" }: AdsterraUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent duplicate injections on re-renders (Strict Mode)
    if (containerRef.current.querySelector('script')) {
      return;
    }

    // Exact script from Adsterra
    const adKey = "fb3ac0074f26c662460ca9af163c83ce";
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `https://pl30927201.effectivecpmnetwork.com/${adKey}/invoke.js`;
    invokeScript.async = true;
    invokeScript.setAttribute("data-cfasync", "false");

    containerRef.current.appendChild(invokeScript);

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        // Keep the container div but remove the script and generated ad content
        const adKey = "fb3ac0074f26c662460ca9af163c83ce";
        containerRef.current.innerHTML = `<div id="container-${adKey}"></div>`;
      }
    };
  }, []);

  return (
    <div className={`w-full flex items-center justify-center my-6 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 p-4 relative ${className}`}>
      <div className="absolute top-2 right-3 text-[9px] font-black uppercase text-gray-400 tracking-wider">Sponsored</div>
      <div ref={containerRef} className="w-full flex justify-center items-center min-h-[50px] min-w-[300px]">
        {/* Exact container ID required by Adsterra */}
        <div id={`container-fb3ac0074f26c662460ca9af163c83ce`}></div>
      </div>
    </div>
  );
}
