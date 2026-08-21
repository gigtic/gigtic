"use client";

import { usePathname } from "next/navigation";

export default function AdsterraMobileSticky() {
  const pathname = usePathname();

  // Hide completely on chat routes so it never blocks the keyboard
  if (pathname.startsWith('/chat') || pathname.startsWith('/ad')) {
    return null;
  }

  // We are using the user's working 468x60 banner
  const adKey = "db6b0a3d8c5a222759075b2244521418";

  return (
    <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200/50 flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-auto shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {/* Container is explicitly 320px to fit on small mobile screens */}
      <div className="w-[320px] h-[50px] relative overflow-hidden flex items-center justify-center">
        {/* Ad Badge */}
        <div className="absolute top-0 right-0 bg-black/10 backdrop-blur-sm text-[8px] font-black uppercase text-gray-500 tracking-wider z-10 px-1 py-0.5 rounded-bl z-20 pointer-events-none">
          Ad
        </div>
        
        {/* Scale the 468x60 ad down to fit inside the 320x50 container (320 / 468 = 0.68 scale) */}
        <div className="w-[468px] h-[60px] origin-center scale-[0.68]">
          <iframe 
            src={`/ad?key=${adKey}&w=468&h=60`}
            width="468" 
            height="60" 
            frameBorder="0" 
            scrolling="no"
            className="w-full h-full border-none pointer-events-auto"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          />
        </div>
      </div>
    </div>
  );
}
