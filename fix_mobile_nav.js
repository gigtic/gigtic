const fs = require('fs');
let navPath = 'apps/web/components/Navigation.tsx';
let navCode = fs.readFileSync(navPath, 'utf8');

// Replace standard mobile bottom bar links with labels and indigo colors
const replacement = `
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-[calc(60px+env(safe-area-inset-bottom))] z-[100] px-1 pb-[env(safe-area-inset-bottom)] shadow-sm"
      >
        <Link href="/" className={\`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors group \${pathname === '/' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}\`}>
          <Home className={\`w-5 h-5 group-active:scale-90 transition-transform \${pathname === '/' ? 'fill-indigo-600/20 stroke-[2.5]' : 'stroke-2'}\`} />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link href="/explore" className={\`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors group \${pathname.startsWith('/explore') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}\`}>
          <Compass className={\`w-5 h-5 group-active:scale-90 transition-transform \${pathname.startsWith('/explore') ? 'fill-indigo-600/20 stroke-[2.5]' : 'stroke-2'}\`} />
          <span className="text-[10px] font-semibold">Explore</span>
        </Link>
        
        {/* Center Action Button */}
        <Link 
          href="/create" 
          className="relative -top-3 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-200 border-4 border-white active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </Link>
        
        <Link href="/chat" className={\`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors group relative \${pathname.startsWith('/chat') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}\`}>
          <div className="relative">
            <MessageCircle className={\`w-5 h-5 group-active:scale-90 transition-transform \${pathname.startsWith('/chat') ? 'fill-indigo-600/20 stroke-[2.5]' : 'stroke-2'}\`} />
            {unreadChats > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Inbox</span>
        </Link>
        
        <Link href="/profile" className={\`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors group \${pathname.startsWith('/profile') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}\`}>
          <User className={\`w-5 h-5 group-active:scale-90 transition-transform \${pathname.startsWith('/profile') ? 'fill-indigo-600/20 stroke-[2.5]' : 'stroke-2'}\`} />
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>
      </nav>
`;

// Find the <nav className="md:hidden ..."> block
const startIndex = navCode.indexOf('<nav \n        className="md:hidden fixed bottom-0');
if (startIndex !== -1) {
  const endIndex = navCode.indexOf('</nav>', startIndex) + 6;
  navCode = navCode.substring(0, startIndex) + replacement.trim() + navCode.substring(endIndex);
  fs.writeFileSync(navPath, navCode);
} else {
  console.log("Could not find mobile nav block");
}
