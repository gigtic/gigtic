const fs = require('fs');
const file = 'apps/admin/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /<\/div>\n        <table className="w-full text-left text-sm">/g,
  '</div>\n        <div className="overflow-x-auto">\n        <table className="w-full text-left text-sm whitespace-nowrap min-w-[400px]">'
);

code = code.replace(
  /<\/table>\n      <\/div>\n    <\/div>/g,
  '</table>\n        </div>\n      </div>\n    </div>'
);

fs.writeFileSync(file, code);
