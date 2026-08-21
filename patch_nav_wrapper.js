const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Find the mobile nav tag
const oldNav = `<nav \n        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 items-center h-[calc(60px+env(safe-area-inset-bottom))] z-[100] px-1 pb-[env(safe-area-inset-bottom)] shadow-sm"\n      >`;
const newNav = `<div className="md:hidden fixed inset-0 pointer-events-none z-[100]">\n      <nav \n        className="absolute bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 items-center h-[calc(60px+env(safe-area-inset-bottom))] pointer-events-auto px-1 pb-[env(safe-area-inset-bottom)] shadow-sm"\n      >`;

code = code.replace(oldNav, newNav);

// 2. Find the closing </nav> for the mobile nav and add </div>
const oldClose = `        </Link>\n      </nav>\n      )}\n    </>\n  );\n}`;
const newClose = `        </Link>\n      </nav>\n      </div>\n      )}\n    </>\n  );\n}`;

code = code.replace(oldClose, newClose);

fs.writeFileSync(file, code);
