"use client";

interface AdsterraMobileStickyProps {
  adKey: string;
}

export default function AdsterraMobileSticky({ adKey }: AdsterraMobileStickyProps) {
  return (
    <div className="md:hidden fixed z-[90] left-0 right-0 w-full flex justify-center pointer-events-none" style={{ bottom: 'calc(64px + env(safe-area-inset-bottom) + 12px)' }}>
      <div className="w-[320px] h-[50px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden relative pointer-events-auto flex items-center justify-center">
        <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase text-gray-400 tracking-wider z-10 px-1.5 py-0.5 rounded-bl shadow-sm">Ad</div>
        <iframe 
          src={`/api/ad?key=${adKey}&width=320&height=50`}
          width="320" 
          height="50" 
          frameBorder="0" 
          scrolling="no" 
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          className="w-full h-full border-none outline-none bg-transparent"
        />
      </div>
    </div>
  );
}
