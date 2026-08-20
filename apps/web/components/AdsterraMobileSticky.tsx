"use client";

interface AdsterraMobileStickyProps {
  adKey: string;
}

export default function AdsterraMobileSticky({ adKey }: AdsterraMobileStickyProps) {
  // Use isolated iframe to prevent global window.atOptions conflicts
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
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div 
      className="md:hidden fixed z-[90] left-0 right-0 w-full flex justify-center pointer-events-none" 
      style={{ 
        bottom: 'calc(64px + env(safe-area-inset-bottom) + 12px)',
        transform: 'translateZ(0)'
      }}
    >
      <div className="w-[320px] h-[50px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-indigo-100/50 overflow-hidden relative pointer-events-auto flex items-center justify-center">
        <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase text-gray-400 tracking-wider z-10 px-1.5 py-0.5 rounded-bl shadow-sm">Ad</div>
        <iframe 
          srcDoc={html} 
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
