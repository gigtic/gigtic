const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else if (f.endsWith('.tsx')) {
      callback(path.join(dir, f));
    }
  });
};

walk('apps/web/app', (file) => {
  // Skip explore, chat, and layout since we already heavily customized them,
  // but we can apply some general tweaks.
  if (file.includes('explore/page.tsx')) return;
  if (file.includes('chat/page.tsx')) return;
  if (file.includes('layout.tsx')) return;

  let code = fs.readFileSync(file, 'utf8');
  let originalCode = code;

  // 1. Swap stark black buttons for vibrant indigo/purple gradients or solids
  code = code.replace(/bg-black text-white/g, 'bg-indigo-600 text-white shadow-lg shadow-indigo-200');
  code = code.replace(/bg-gray-900/g, 'bg-indigo-500');
  code = code.replace(/hover:bg-gray-900/g, 'hover:bg-indigo-500');
  
  // 2. Round out the corners to match the playful aesthetic
  code = code.replace(/rounded-xl/g, 'rounded-2xl');
  code = code.replace(/rounded-lg/g, 'rounded-xl');
  
  // 3. Make backgrounds slightly softer
  code = code.replace(/bg-\[#FAFAFA\]/g, 'bg-slate-50');
  
  // 4. Update the red destructive buttons to be rose
  code = code.replace(/bg-red-600/g, 'bg-rose-500');
  code = code.replace(/hover:bg-red-700/g, 'hover:bg-rose-600 shadow-md shadow-rose-200');
  code = code.replace(/text-red-600/g, 'text-rose-500');
  
  // 5. Thicken borders and inputs
  code = code.replace(/border-gray-200/g, 'border-indigo-100/50');
  code = code.replace(/border border-gray-100/g, 'border-2 border-indigo-50/50');
  code = code.replace(/focus:ring-black\/5/g, 'focus:ring-indigo-100');
  code = code.replace(/focus:border-black/g, 'focus:border-indigo-300');
  
  // 6. Give containers a playful heavy border/shadow combo
  code = code.replace(/shadow-sm/g, 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]');
  
  // 7. Make typography punchier
  code = code.replace(/text-gray-900/g, 'text-slate-800');
  code = code.replace(/text-gray-500/g, 'text-slate-500');
  code = code.replace(/font-bold/g, 'font-extrabold');

  if (code !== originalCode) {
    fs.writeFileSync(file, code);
    console.log(`Updated ${file}`);
  }
});

// Update standard components
walk('apps/web/components', (file) => {
  if (file.includes('Navigation.tsx')) return;
  
  let code = fs.readFileSync(file, 'utf8');
  let originalCode = code;

  code = code.replace(/bg-black text-white/g, 'bg-indigo-600 text-white shadow-lg shadow-indigo-200');
  code = code.replace(/rounded-xl/g, 'rounded-2xl');
  code = code.replace(/border-gray-200/g, 'border-indigo-100/50');
  code = code.replace(/font-bold/g, 'font-extrabold');

  if (code !== originalCode) {
    fs.writeFileSync(file, code);
    console.log(`Updated ${file}`);
  }
});
