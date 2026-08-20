const fs = require('fs');

const filesToPatch = [
  'apps/web/app/job/[id]/page.tsx',
  'apps/web/app/explore/page.tsx',
  'apps/web/app/page.tsx',
  'apps/web/app/create/page.tsx',
  'apps/web/app/profile/page.tsx'
];

filesToPatch.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/ pb-32"/g, ' pb-6 md:pb-32"');
    code = code.replace(/ pb-24 z-20"/g, ' pb-6 md:pb-24 z-20"');
    fs.writeFileSync(file, code);
  }
});
