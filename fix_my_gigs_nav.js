const fs = require('fs');
let navPath = 'apps/web/components/Navigation.tsx';
let navCode = fs.readFileSync(navPath, 'utf8');

const target = `<div className="flex items-center gap-1">
          <Link href="/notifications" className="relative p-2 text-gray-400 hover:text-black">`;

const replacement = `<div className="flex items-center gap-1">
          <Link href="/gigs" className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
            <Briefcase className="w-5 h-5" />
          </Link>
          <Link href="/notifications" className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">`;

navCode = navCode.replace(target, replacement);

fs.writeFileSync(navPath, navCode);
