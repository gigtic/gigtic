const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add useRef import if missing
if (!code.includes('useRef')) {
    code = code.replace(/import \{ useEffect, useState \} from "react";/, 'import { useEffect, useState, useRef } from "react";');
}

// 2. Add ref for current URL
code = code.replace(
    /const isChatRoom = pathname === '\/chat' && \(searchParams.has\('conv'\) \|\| searchParams.has\('dm'\)\);/,
    `const isChatRoom = pathname === '/chat' && (searchParams.has('conv') || searchParams.has('dm'));\n  const currentUrlRef = useRef(pathname + '?' + searchParams.toString());\n  useEffect(() => { currentUrlRef.current = pathname + '?' + searchParams.toString(); }, [pathname, searchParams]);`
);

// 3. Suppress toast logic
const oldToast = /if \(lastSeenNotifId !== latest\.id && currentCount > lastKnownUnreadCount\) \{[\s\S]*?const urlPart = typeof latest\.type === 'string' && latest\.type\.includes\('\|'\) \? latest\.type\.split\('\|'\)\[1\] : null;/;

const newToast = `if (lastSeenNotifId !== latest.id && currentCount > lastKnownUnreadCount) {
             const urlPart = typeof latest.type === 'string' && latest.type.includes('|') ? latest.type.split('|')[1] : null;
             
             // Suppress if the user is actively viewing the exact page this notification points to (e.g. they are in the active chat room)
             let shouldShow = true;
             if (urlPart) {
                // urlPart might be '/chat?job=123&conv=456'
                // currentUrlRef.current might be '/chat?job=123&conv=456'
                if (urlPart === currentUrlRef.current || currentUrlRef.current.startsWith(urlPart)) {
                    shouldShow = false;
                }
             }

             if (shouldShow) {`;

code = code.replace(oldToast, newToast);

// Close the if statement
code = code.replace(/\{ duration: 5000, position: 'top-center', id: latest\.id \}\n             \);/g, `{ duration: 5000, position: 'top-center', id: latest.id }\n             );\n             }`);

fs.writeFileSync(file, code);
