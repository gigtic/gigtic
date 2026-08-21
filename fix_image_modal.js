const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add state for selectedImage
if (!code.includes('const [selectedImage, setSelectedImage]')) {
  const stateInjectionTarget = `const [isSubmitting, setIsSubmitting] = useState(false);`;
  code = code.replace(stateInjectionTarget, `const [isSubmitting, setIsSubmitting] = useState(false);\n  const [selectedImage, setSelectedImage] = useState<string | null>(null);`);
}

// 2. Change the <a> tag around the image to a button that sets selectedImage
const imageLinkTarget = /<a href=\{msg\.image_url\} target="_blank" rel="noopener noreferrer">([\s\S]*?)<\/a>/;
if (imageLinkTarget.test(code)) {
  code = code.replace(imageLinkTarget, `<button onClick={() => setSelectedImage(msg.image_url)} className="block w-full text-left transition-transform active:scale-95">$1</button>`);
}

// 3. Add the fullscreen modal at the end of the ChatContent return statement
const modalCode = `
      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={selectedImage} 
            alt="Fullscreen photo" 
            className="max-w-full max-h-full object-contain rounded-sm"
          />
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {`;

code = code.replace(`    </div>\n  );\n}\n\nexport default function ChatPage() {`, modalCode);

fs.writeFileSync(file, code);
