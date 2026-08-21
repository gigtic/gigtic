const fs = require('fs');

// 1. Fix AdsterraMobileSticky
let adFile = 'apps/web/components/AdsterraMobileSticky.tsx';
let adCode = fs.readFileSync(adFile, 'utf8');

adCode = `"use client";

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
    <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200/50 flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-auto shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="w-[320px] h-[50px] relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 right-0 bg-black/10 backdrop-blur-sm text-[8px] font-black uppercase text-gray-500 tracking-wider z-10 px-1 py-0.5 rounded-bl z-20 pointer-events-none">
          Ad
        </div>
        
        <iframe 
          key={pathname}
          src={\`/ad?key=\${adKey}&w=320&h=50\`}
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

export default function AdsterraMobileSticky({ adKey }: { adKey?: string }) {
  return (
    <Suspense fallback={null}>
      <AdsterraMobileStickyInner adKey={adKey} />
    </Suspense>
  );
}`;

fs.writeFileSync(adFile, adCode);

// 2. Fix ChatPage style injection
let chatFile = 'apps/web/app/chat/page.tsx';
let chatCode = fs.readFileSync(chatFile, 'utf8');

// Remove the unconditionally injected style from ChatPage
const oldStyleBlockTarget = /<style dangerouslySetInnerHTML=\{\{__html: `[\s\S]*?`\}\} \/>/;
if (chatCode.match(oldStyleBlockTarget)) {
  chatCode = chatCode.replace(oldStyleBlockTarget, '');
}

// Add the conditionally injected style inside ChatContent
const contentReturnTarget = /if \(!currentUser\) return null;\n\n  return \(/;
const conditionalStyle = `if (!currentUser) return null;

  const isChatRoom = !!jobId || !!dmParam;

  return (
    <>
      {isChatRoom && (
        <style dangerouslySetInnerHTML={{__html: \`
          html, body {
            padding-bottom: 0px !important;
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
            height: 100% !important;
            touch-action: none !important;
          }
        \`}} />
      )}`;

chatCode = chatCode.replace(contentReturnTarget, conditionalStyle);

// Also fix the bottom div wrapper to be a fragment or ensure closing tag is correct
// Since we wrapped return in <>, we need to close it at the end of ChatContent
// Find the last </div> before export default function ChatPage
const endOfChatContentTarget = /(?:\s*<\/div>\s*)\}\s*export default function ChatPage/;
// Wait, the end of ChatContent is literally at the end of the file before ChatPage
// Let's replace the last `  );` inside ChatContent with `    </>\n  );`
const lastReturnCloseTarget = /      \{\/\* Fullscreen Image Modal \*\/\}[\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*\);\s*\}/;
// Actually, it's easier to just use string replacement on the exact return block
chatCode = chatCode.replace(/<\/div>\s*\);\s*\}/, '</div>\n    </>\n  );\n}');

fs.writeFileSync(chatFile, chatCode);
