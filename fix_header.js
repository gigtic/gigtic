const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the Chat Header layout to be responsive and truncate long text
const target = `<div className="bg-white/80 backdrop-blur-xl border-b-2 border-indigo-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <Link href={dmParam ? "/chat" : (isRequester && conversationParam ? \`/chat?job=\${jobId}\` : \`/job/\${jobId}\`)} className="p-2 mr-2 -ml-2 text-indigo-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 transform hover:scale-105 transition-transform">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 leading-tight">
              {dmParam ? \`Chat with \${conversation?.requester_id === currentUser?.id ? conversation?.worker?.username : conversation?.requester?.username}\` : (isRequester ? \`Chat with \${conversation?.worker?.username}\` : job?.title)}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              {dmParam ? "Direct Message" : \`₹\${job?.budget_amount} • \${job?.status}\`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">`;

const replacement = `<div className="bg-white/80 backdrop-blur-xl border-b-2 border-indigo-100 px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0 shadow-sm z-30 w-full overflow-hidden gap-2">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Link href={dmParam ? "/chat" : (isRequester && conversationParam ? \`/chat?job=\${jobId}\` : \`/job/\${jobId}\`)} className="p-1.5 sm:p-2 sm:mr-2 text-indigo-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight truncate">
              {dmParam ? \`Chat with \${conversation?.requester_id === currentUser?.id ? conversation?.worker?.username : conversation?.requester?.username}\` : (isRequester ? \`Chat with \${conversation?.worker?.username}\` : job?.title)}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              {dmParam ? "Direct Message" : \`₹\${job?.budget_amount} • \${job?.status}\`}
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 sm:gap-2 shrink-0">`;

code = code.replace(target, replacement);

// Fix "Assign to this User" button size
code = code.replace(
  `className="px-6 py-2.5 rounded-2xl font-black text-sm bg-indigo-500 text-white hover:bg-indigo-400 active:scale-95 transition-all shadow-lg shadow-indigo-200"`,
  `className="px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold sm:font-black text-xs sm:text-sm bg-indigo-500 text-white hover:bg-indigo-400 active:scale-95 transition-all shadow-md sm:shadow-lg shadow-indigo-200 whitespace-nowrap"`
);

// Fix "Drop Gig" button size
code = code.replace(
  `className="px-5 py-2.5 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all"`,
  `className="px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all whitespace-nowrap"`
);

// Fix "Mark as Received" button size
code = code.replace(
  `className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md"`,
  `className="px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-sm sm:shadow-md whitespace-nowrap"`
);

fs.writeFileSync(file, code);
