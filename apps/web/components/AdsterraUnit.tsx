"use client";

interface AdsterraUnitProps {
  className?: string;
}

export default function AdsterraUnit({ className = "" }: AdsterraUnitProps) {
  return (
    <div className={`w-full flex items-center justify-center my-6 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 p-2 relative ${className}`}>
      <div className="absolute top-1 right-2 text-[8px] font-black uppercase text-gray-400 tracking-wider z-10 pointer-events-none">Sponsored</div>
      <div className="w-full flex justify-center items-center overflow-hidden">
        <iframe 
          src="/ad?key=db6b0a3d8c5a222759075b2244521418&w=320&h=50"
          width="320" 
          height="50" 
          frameBorder="0" 
          scrolling="no"
          className="max-w-full border-none"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
}
