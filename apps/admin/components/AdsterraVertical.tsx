"use client";

import { useEffect, useRef } from "react";

interface AdsterraVerticalProps {
  className?: string;
  adKey: string;
  height?: number;
}

export default function AdsterraVertical({ className = "", adKey, height = 300 }: AdsterraVerticalProps) {
  // We use an isolated iframe so that window.atOptions doesn't conflict when multiple ads render
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : 160,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://wistfulseverely.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div 
      className={`w-[160px] flex items-center justify-center rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="absolute top-2 right-2 text-[9px] font-black uppercase text-gray-400 tracking-wider z-10 bg-white/80 px-1 rounded shadow-sm">Ad</div>
      <iframe 
        srcDoc={html} 
        width="160" 
        height={height} 
        frameBorder="0" 
        scrolling="no" 
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        className="w-full h-full border-none outline-none bg-transparent"
      />
    </div>
  );
}
