const fs = require('fs');
const file = 'apps/web/app/job/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /<MapPicker pincode="" onLocationSelect=\{.*?\} \/>\n\s*<\/div>\n\s*<\/div>\n\s*\)}/g,
  `$&
          
          {/* Adsterra Native Banner at the bottom of the content */}
          <div className="pt-4">
            <AdsterraUnit />
          </div>`
);

fs.writeFileSync(file, code);
