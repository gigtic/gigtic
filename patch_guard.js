const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import GlobalGuard")) {
  code = code.replace(/import Navigation from "@\/components\/Navigation";/, 'import Navigation from "@/components/Navigation";\nimport GlobalGuard from "@/components/GlobalGuard";');
  code = code.replace(/<main className="flex-1 min-w-0 max-w-7xl min-h-\[calc\(100vh-64px\)\] relative z-10">\n\s*\{children\}\n\s*<\/main>/, '<main className="flex-1 min-w-0 max-w-7xl min-h-[calc(100vh-64px)] relative z-10">\n            <GlobalGuard>{children}</GlobalGuard>\n          </main>');
  fs.writeFileSync(file, code);
}
