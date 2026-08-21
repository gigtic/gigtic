"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AdsterraMobileStickyInner({ adKey = "db6b0a3d8c5a222759075b2244521418" }: { adKey?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isChatRoom = pathname.startsWith('/chat') && (searchParams.has('job') || searchParams.has('dm'));

  // Hide completely on actual chat rooms and ad frames (but show on Inbox view)
  if (isChatRoom || pathname.startsWith('/ad')) {
    return null;
  }

  return (
    <div className="md:hidden fixed inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200/50 flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-auto shadow-[0_-4px_12px_rgba(0,0,0,0.05)]" style={{ bottom: "60px", position: "fixed", transform: "translateZ(0)" }}>
      <div className="w-[320px] h-[50px] relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 right-0 bg-black/10 backdrop-blur-sm text-[8px] font-black uppercase text-gray-500 tracking-wider z-10 px-1 py-0.5 rounded-bl z-20 pointer-events-none">
          Ad
        </div>
        
        <iframe 
          key={pathname}
          src={`/ad?key=${adKey}&w=320&h=50`}
          width="320" 
          height="50" 
          frameBorder="0" 
          scrolling="no"
          className="w-full h-full border-none pointer-events-auto"
        />
      </div>
    </div>
  );
}

export default function AdsterraMobileSticky({ adKey }: { adKey?: string }) {
  return (
    <Suspense fallback={null}>
      <AdsterraMobileStickyInner adKey={adKey} />
    </Suspense>
  );
}