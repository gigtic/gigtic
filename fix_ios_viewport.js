const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('iOSViewportFix')) {
    code = code.replace(
        'import Script from "next/script";',
        'import Script from "next/script";\nimport IOSViewportFix from "@/components/IOSViewportFix";'
    );
    code = code.replace(
        '<PresenceTracker />',
        '<PresenceTracker />\n        <IOSViewportFix />'
    );
    fs.writeFileSync(file, code);
}
