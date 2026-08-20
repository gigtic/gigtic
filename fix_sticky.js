const fs = require('fs');
let navPath = 'apps/web/components/Navigation.tsx';
let navCode = fs.readFileSync(navPath, 'utf8');

// Change top headers from sticky to fixed
navCode = navCode.replace(
  /className="hidden md:flex bg-white\/60 backdrop-blur-xl border-b border-gray-200\/50 h-16 items-center px-8 sticky top-0/g,
  'className="hidden md:flex bg-white/60 backdrop-blur-xl border-b border-gray-200/50 h-16 items-center px-8 fixed top-0 left-0 right-0'
);

navCode = navCode.replace(
  /className="md:hidden bg-white\/90 backdrop-blur-xl border-b border-gray-200\/50 h-14 flex items-center justify-between px-4 sticky top-0/g,
  'className="md:hidden bg-white/90 backdrop-blur-xl border-b border-gray-200/50 h-14 flex items-center justify-between px-4 fixed top-0 left-0 right-0'
);

fs.writeFileSync(navPath, navCode);

let layoutPath = 'apps/web/app/layout.tsx';
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

// Add padding-top to the main wrapper to account for the fixed header
// Desktop header is h-16 (64px), Mobile header is h-14 (56px)
layoutCode = layoutCode.replace(
  /<div className="flex w-full max-w-\[1500px\] mx-auto justify-center gap-6">/g,
  '<div className="flex w-full max-w-[1500px] mx-auto justify-center gap-6 pt-14 md:pt-16">'
);

// We should also adjust the left/right aside sticky positions because they are now offset
// Desktop sidebar is sticky top-16, which is correct because the header is h-16. But wait, if they are sticky, they need top-16 relative to viewport, which is fine.
// Let's test the layout.

fs.writeFileSync(layoutPath, layoutCode);
