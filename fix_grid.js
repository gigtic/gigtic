const fs = require('fs');
let navPath = 'apps/web/components/Navigation.tsx';
let navCode = fs.readFileSync(navPath, 'utf8');

navCode = navCode.replace(
  /className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 flex justify-around items-center/g,
  'className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 items-center'
);

navCode = navCode.replace(
  /className="relative -top-3 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-200 border-4 border-white active:scale-95 transition-transform"/g,
  'className="relative -top-3 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-200 border-4 border-white active:scale-95 transition-transform mx-auto shrink-0"'
);

// We should also change the wrapper of the center button to be flex, so it centers the button. 
// Right now it's just a Link. In a grid, it spans 1 column. 
// If we add mx-auto to it, it should center itself within its grid cell.

fs.writeFileSync(navPath, navCode);
