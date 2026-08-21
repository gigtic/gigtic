const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// The whole CHAT ROOM VIEW starts around 533 and ends at 714
// We can just replace from `// CHAT ROOM VIEW` to the end of `ChatContent` function
const chatRoomViewStart = code.indexOf('// CHAT ROOM VIEW');
const chatContentEnd = code.lastIndexOf('  );\\n}', code.indexOf('export default function ChatPage()')) || code.lastIndexOf('  );\\n}\\n\\nexport default function ChatPage()');

// Actually, I can just use a regex for the entire return statement of ChatRoomView.
const fullReturnRegex = /return \(\n\s*<div className="fixed inset-0 md:relative md:inset-auto z-40[\s\S]*?\}\n    <\/div>\n  \);\n\}/;

const newReturn = `return (
    <div className="fixed inset-0 md:relative md:inset-auto z-40 pt-[56px] md:pt-0 h-[100dvh] md:h-[calc(100vh-64px)] flex flex-col bg-[#EFEAE2] font-sans max-w-5xl mx-auto w-full">
      
      {/* WhatsApp Style Header */}
      <div className="bg-[#F0F2F5] border-b border-gray-200/60 px-2 py-2 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Link href={dmParam ? "/chat" : (isRequester && conversationParam ? \`/chat?job=\${jobId}\` : \`/job/\${jobId}\`)} className="p-2 -ml-1 text-[#54656f] hover:bg-black/5 active:bg-black/10 rounded-full transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <div className="w-[38px] h-[38px] rounded-full bg-slate-300 flex items-center justify-center text-white overflow-hidden shrink-0 shadow-sm">
              <User className="w-6 h-6" />
            </div>
          </Link>
          <div className="flex flex-col justify-center">
            <h2 className="text-[16px] font-semibold text-[#111b21] leading-tight">
              {dmParam ? (conversation?.requester_id === currentUser?.id ? conversation?.worker?.username : conversation?.requester?.username) : (isRequester ? conversation?.worker?.username : job?.title)}
            </h2>
            <p className="text-[13px] text-[#667781] leading-tight mt-0.5">
              {dmParam ? "online" : \`₹\${job?.budget_amount} • \${job?.status}\`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pr-2">
          {!isRequester && !dmParam && (
            <button 
              onClick={() => handleAddFriend(job?.requester_id)}
              className="p-2 rounded-full text-[#54656f] hover:bg-black/5 active:scale-95 transition-all"
              title="Add Friend"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}
          {isRequester && job?.status === 'OPEN' && (
            <button onClick={handleAssignGig} className="px-4 py-1.5 rounded-full font-bold text-sm bg-[#00A884] text-white active:scale-95">
              Assign
            </button>
          )}
          {isProvider && job?.status === 'IN_PROGRESS' && (
            <button onClick={handleDropGig} className="px-4 py-1.5 rounded-full font-bold text-sm bg-red-50 text-red-600 active:scale-95">
              Drop
            </button>
          )}
          {(isRequester || isProvider) && job?.status === 'IN_PROGRESS' && (
            <button onClick={handleHandshake} className={\`p-2 rounded-full transition-all shadow-sm \${(isRequester && job.requester_marked_paid) || (!isRequester && job.provider_marked_received) ? "bg-[#d9fdd3] text-[#111b21]" : "bg-[#00A884] text-white active:scale-95"}\`}>
              <Handshake className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-1.5 bg-[#EFEAE2] scroll-smooth" style={{ backgroundImage: "url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')", backgroundSize: "400px", backgroundRepeat: "repeat", opacity: 0.9 }}>
        
        <div className="flex justify-center my-4">
          <div className="bg-[#FFEECD] text-[#54656f] text-[12px] px-4 py-2 rounded-lg text-center shadow-sm max-w-sm">
            <span className="font-semibold text-amber-600">GigTic Protection</span><br/>
            Keep all negotiations and payments on campus for your safety.
          </div>
        </div>

        {!readReceiptsUnlocked && messages.length > 0 && (
          <div className="flex justify-center my-4">
            <PremiumUnlockButton 
              title="Unlock Read Receipts"
              description="See exactly when your messages are read with blue double-checkmarks."
              buttonText="Unlock Read Receipts"
              onUnlock={handleUnlockReceipts}
              className="max-w-md w-full shadow-sm"
            />
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={idx} className={\`flex w-full \${isMe ? 'justify-end' : 'justify-start'} mb-[2px]\`}>
              <div 
                className={\`relative max-w-[85%] sm:max-w-[70%] px-2.5 py-1.5 text-[15px] shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] \${
                  isMe 
                    ? "bg-[#d9fdd3] rounded-lg rounded-tr-none" 
                    : "bg-white rounded-lg rounded-tl-none"
                }\`}
              >
                {!isMe && dmParam && (
                  <div className="text-[12px] font-bold text-[#e53935] mb-0.5">
                    {msg.sender?.username || "User"}
                  </div>
                )}
                <div className="text-[#111b21] leading-snug break-words" style={{ paddingRight: '3.5rem', paddingBottom: '0.2rem' }}>
                  {msg.content}
                </div>
                <div className="absolute bottom-1 right-2 flex items-center gap-0.5">
                  <span className="text-[10.5px] text-[#667781] font-medium leading-none">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <CheckCheck className={\`w-[15px] h-[15px] \${readReceiptsUnlocked ? 'text-[#53bdeb]' : 'text-[#8696a0]'}\`} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex w-full justify-start mb-[2px]">
            <div className="bg-white rounded-lg rounded-tl-none px-4 py-2 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] text-[#667781] text-sm font-medium italic">
              typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {(!job || (job.status !== 'COMPLETED' && job.status !== 'ABANDONED' && job.status !== 'DELETED')) && (
        <div className="bg-[#F0F2F5] p-2 sm:p-3 shrink-0 pb-[max(env(safe-area-inset-bottom),8px)] z-50">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-2">
            <div className="flex-1 bg-white rounded-[24px] flex items-center shadow-sm min-h-[44px] px-4 py-1">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  const now = Date.now();
                  if (now - lastTypingEventRef.current > 1000 && broadcastChannelRef.current) {
                    lastTypingEventRef.current = now;
                    broadcastChannelRef.current.send({
                      type: 'broadcast',
                      event: 'typing',
                      payload: { userId: currentUser?.id }
                    });
                  }
                }}
                placeholder="Type a message"
                className="w-full bg-transparent py-2.5 outline-none text-[#111b21] text-[16px] resize-none max-h-32 self-center leading-normal"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      e.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
              />
            </div>
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="w-[44px] h-[44px] bg-[#00A884] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm active:scale-95 disabled:opacity-0 disabled:scale-75 transition-all duration-200 ease-out"
            >
              <Send className="w-[18px] h-[18px] ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(fullReturnRegex, newReturn);
fs.writeFileSync(file, code);
