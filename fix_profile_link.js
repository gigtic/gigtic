const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>`;

const replacement = `<Link 
            href={conversation ? \`/user/\${conversation.requester_id === currentUser?.id ? conversation.worker_id : conversation.requester_id}\` : '#'} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);
