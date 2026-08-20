const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

// The file already imports Link from next/link:
// import Link from "next/link";

// We need to replace all `<a ` with `<Link ` and `</a>` with `</Link>`.
// However, we should only replace `href=` and `className=`.
// Let's replace the opening and closing tags carefully.
code = code.replace(/<a /g, '<Link ');
code = code.replace(/<\/a>/g, '</Link>');

fs.writeFileSync(file, code);
