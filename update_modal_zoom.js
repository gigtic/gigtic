const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('TransformWrapper')) {
  // 1. Import
  code = code.replace(
    /import \{ (.*?) \} from "lucide-react";/,
    `import { $1 } from "lucide-react";\nimport { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";`
  );

  // 2. Update Modal
  const modalTarget = /{selectedImage && \([\s\S]*?className="fixed inset-0 z-\[100\] bg-black\/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"[\s\S]*?onClick=\{\(\) => setSelectedImage\(null\)\}[\s\S]*?>[\s\S]*?\{\/\* eslint-disable-next-line @next\/next\/no-img-element \*\/\}[\s\S]*?<img[\s\S]*?src=\{selectedImage\}[\s\S]*?alt="Fullscreen photo"[\s\S]*?className="max-w-full max-h-full object-contain rounded-sm"[\s\S]*?\/>[\s\S]*?<button[\s\S]*?onClick=\{\(\) => setSelectedImage\(null\)\}[\s\S]*?className="absolute top-6 right-6 w-10 h-10 bg-white\/10 hover:bg-white\/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"[\s\S]*?>[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?\)}/;

  const modalReplacement = `{selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md animate-in fade-in duration-200"
        >
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerOnInit={true}
            doubleClick={{ mode: "zoomIn" }}
          >
            <TransformComponent wrapperStyle={{ width: "100%", height: "100vh" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedImage} 
                alt="Fullscreen photo" 
                className="max-w-full max-h-full object-contain pointer-events-auto"
              />
            </TransformComponent>
          </TransformWrapper>
          
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-lg transition-colors z-[110]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}`;

  code = code.replace(modalTarget, modalReplacement);
  fs.writeFileSync(file, code);
}
