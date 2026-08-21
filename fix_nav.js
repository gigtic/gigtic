const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add useSearchParams to import
code = code.replace(
  /import \{ usePathname \} from "next\/navigation";/g,
  'import { usePathname, useSearchParams } from "next/navigation";'
);

// Add useSearchParams inside component
code = code.replace(
  /const pathname = usePathname\(\);/g,
  `const pathname = usePathname();\n  const searchParams = useSearchParams();`
);

// We need to hide the bottom tab bar on the chat room.
// The chat room is either /chat?conv=... or /chat?dm=...
// The bottom tab bar starts with:
// <nav \n        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 items-center h-[calc(60px+env(safe-area-inset-bottom))] z-[100] px-1 pb-[env(safe-area-inset-bottom)] shadow-sm"\n      >
// We will change its display class conditionally.
const navTarget = `<nav \n        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 items-center h-[calc(60px+env(safe-area-inset-bottom))] z-[100] px-1 pb-[env(safe-area-inset-bottom)] shadow-sm"\n      >`;

const isChatRoomStr = `const isChatRoom = pathname === '/chat' && (searchParams.has('conv') || searchParams.has('dm'));`;
const replacement = `{/* Anchored Bottom Tab Bar for Mobile */}
      {!isChatRoom && (
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 items-center h-[calc(60px+env(safe-area-inset-bottom))] z-[100] px-1 pb-[env(safe-area-inset-bottom)] shadow-sm"
      >`;

// Wait, I need to inject `isChatRoom` inside the render body.
// I'll put it right after `searchParams` hook.
code = code.replace(
  /const searchParams = useSearchParams\(\);/g,
  `const searchParams = useSearchParams();\n  const isChatRoom = pathname === '/chat' && (searchParams.has('conv') || searchParams.has('dm'));`
);

// Wrap the nav tag
code = code.replace(navTarget, `{!isChatRoom && (\n<nav \n        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 items-center h-[calc(60px+env(safe-area-inset-bottom))] z-[100] px-1 pb-[env(safe-area-inset-bottom)] shadow-sm"\n      >`);

// Now close it
const endNavTarget = `</nav>`;
const replaceEndNav = `</nav>\n      )}`;
// I need to be careful with replaceEndNav to only match the bottom nav.
// Since there's only one <nav> in the file, it's safe.
// Wait, is there only one <nav>?
if ((code.match(/<\/nav>/g) || []).length === 1) {
  code = code.replace(endNavTarget, replaceEndNav);
} else {
  // If there are multiple, I need to find the specific one.
  code = code.replace(
    /<\/span>\n\s*<\/Link>\n\s*<\/nav>/g,
    `</span>\n        </Link>\n      </nav>\n      )}`
  );
}

fs.writeFileSync(file, code);
