"use client";

import { usePathname } from "next/navigation";

export default function AdsterraMobileSticky({ adKey = "b8e48a108a8fec93539050d2bb525545" }: { adKey?: string }) {
  const pathname = usePathname();

  // Hide completely on chat routes so it never blocks the keyboard
  if (pathname.startsWith('/chat')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200/50 flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-auto shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="w-[320px] h-[50px] relative overflow-hidden flex items-center justify-center">
        {/* Ad Badge */}
        <div className="absolute top-0 right-0 bg-black/10 backdrop-blur-sm text-[8px] font-black uppercase text-gray-500 tracking-wider z-10 px-1 py-0.5 rounded-bl z-20 pointer-events-none">
          Ad
        </div>
        
        {/* Safe Iframe for document.write ads */}
        <iframe 
          src={`/ad?key=${adKey}&w=320&h=50`}
          width="320" 
          height="50" 
          frameBorder="0" 
          scrolling="no"
          className="w-full h-full border-none pointer-events-auto"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
}
