const fs = require('fs');
let stickyPath = 'apps/web/components/AdsterraMobileSticky.tsx';

const newCode = `"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface AdsterraMobileStickyProps {
  adKey: string;
}

export default function AdsterraMobileSticky({ adKey }: AdsterraMobileStickyProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || pathname.startsWith('/chat')) return;

    if (containerRef.current.querySelector('script')) {
      return;
    }

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = \`https://pl30927201.effectivecpmnetwork.com/\${adKey}/invoke.js\`;
    invokeScript.async = true;
    invokeScript.setAttribute("data-cfasync", "false");
    
    // Add the atOptions globally before the script loads
    window.atOptions = {
      'key' : adKey,
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };

    containerRef.current.appendChild(invokeScript);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = \`<div id="container-\${adKey}"></div>\`;
      }
    };
  }, [adKey, pathname]);

  // Hide entirely in chat to prevent blocking keyboard or conversation
  if (pathname.startsWith('/chat')) return null;

  return (
    <div 
      className="md:hidden fixed z-[90] left-0 right-0 w-full flex justify-center pointer-events-none" 
      style={{ 
        bottom: 'calc(60px + env(safe-area-inset-bottom) + 8px)',
        transform: 'translateZ(0)'
      }}
    >
      <div className="w-[320px] h-[50px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden relative pointer-events-auto flex items-center justify-center">
        <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase text-gray-400 tracking-wider z-10 px-1.5 py-0.5 rounded-bl shadow-sm">Ad</div>
        <div ref={containerRef} className="w-[320px] h-[50px] flex items-center justify-center bg-transparent">
          <div id={\`container-\${adKey}\`}></div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(stickyPath, newCode);
