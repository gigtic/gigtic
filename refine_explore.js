const fs = require('fs');
const file = 'apps/web/app/explore/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Refine gig card styles for mobile
code = code.replace(
  /rounded-\[32px\] border-2 border-slate-100 p-6/g,
  'rounded-2xl md:rounded-[32px] border border-slate-100 md:border-2 p-5 md:p-6'
);

// Reduce top padding on main container
code = code.replace(
  /<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">/g,
  '<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">'
);

fs.writeFileSync(file, code);
