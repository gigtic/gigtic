const fs = require('fs');

// Patch layout.tsx
let layoutCode = fs.readFileSync('apps/web/app/layout.tsx', 'utf8');
layoutCode = layoutCode.replace(/<AdsterraMobileSticky adKey=\{"54114b0e7bc2595dc053f6499e762802"\} \/>/, '<AdsterraMobileSticky adKey={"7f3286128752fe83d078b48ca0c7face"} />');
fs.writeFileSync('apps/web/app/layout.tsx', layoutCode);

// Patch AdsterraMobileSticky.tsx
let stickyCode = fs.readFileSync('apps/web/components/AdsterraMobileSticky.tsx', 'utf8');
stickyCode = stickyCode.replace(/wistfulseverely\.com/g, 'www.highperformanceformat.com');
fs.writeFileSync('apps/web/components/AdsterraMobileSticky.tsx', stickyCode);

