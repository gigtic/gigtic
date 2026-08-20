const fs = require('fs');
let navPath = 'apps/web/components/Navigation.tsx';
let navCode = fs.readFileSync(navPath, 'utf8');

// Add Users import
navCode = navCode.replace(
  /User, Bell, Plus, MessageCircle }/g,
  'User, Users, Bell, Plus, MessageCircle }'
);

const target = `<Link href="/gigs" className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">`;

const replacement = `<Link href="/friends" className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
            <Users className="w-5 h-5" />
          </Link>
          <Link href="/gigs" className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">`;

navCode = navCode.replace(target, replacement);

fs.writeFileSync(navPath, navCode);
