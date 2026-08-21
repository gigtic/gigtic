const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Replace the Chat Header
const oldHeaderRegex = /\{\/\* Chat Header \*\/\}.*?(?=\{\/\* Messages Area \*\/\})/s;
const newHeader = `{/* Chat Header */}
      <div className="bg-[#F0F2F5] border-b border-gray-200/60 px-3 py-2.5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <Link href={dmParam ? "/chat" : (isRequester && conversationParam ? \`/chat?job=\${jobId}\` : \`/job/\${jobId}\`)} className="p-1.5 -ml-1 text-indigo-600 active:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </Link>
          <div className="w-[42px] h-[42px] rounded-full bg-slate-300 flex items-center justify-center text-white overflow-hidden shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[16px] font-semibold text-gray-900 leading-tight">
              {dmParam ? (conversation?.requester_id === currentUser?.id ? conversation?.worker?.username : conversation?.requester?.username) : (isRequester ? conversation?.worker?.username : job?.title)}
            </h2>
            <p className="text-[13px] text-gray-500 leading-tight mt-0.5">
              {dmParam ? "Direct Message" : \`₹\${job?.budget_amount} • \${job?.status}\`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isRequester && !dmParam && (
            <button 
              onClick={() => handleAddFriend(job?.requester_id)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 active:scale-95 transition-all"
              title="Add Friend"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}
          {isRequester && job?.status === 'OPEN' && (
            <button onClick={handleAssignGig} className="px-4 py-1.5 rounded-full font-bold text-sm bg-indigo-600 text-white active:scale-95">
              Assign
            </button>
          )}
          {isProvider && job?.status === 'IN_PROGRESS' && (
            <button onClick={handleDropGig} className="px-4 py-1.5 rounded-full font-bold text-sm bg-red-100 text-red-600 active:scale-95">
              Drop
            </button>
          )}
          {(isRequester || isProvider) && job?.status === 'IN_PROGRESS' && (
            <button onClick={handleHandshake} className={\`p-2 rounded-full transition-all \${(isRequester && job.requester_marked_paid) || (!isRequester && job.provider_marked_received) ? "bg-green-100 text-green-600" : "bg-indigo-600 text-white active:scale-95"}\`}>
              <Handshake className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>\n\n      `;
code = code.replace(oldHeaderRegex, newHeader);

// 2. Replace Messages Area Background
code = code.replace(/className="flex-1 overflow-y-auto p-6 space-y-5 bg-\[\#FAFAFA\] scroll-smooth"/, `className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#EFEAE2] scroll-smooth"`);

// 3. Replace Message Bubbles mapping
const oldMessagesRegex = /\{messages\.map\(\(msg, idx\) => \{[\s\S]*?\}\)\}/;
const newMessages = `{messages.map((msg, idx) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={idx} className={\`flex w-full \${isMe ? 'justify-end' : 'justify-start'} mb-1.5\`}>
              <div 
                className={\`relative max-w-[85%] sm:max-w-[75%] px-2.5 py-1.5 text-[15px] shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] \${
                  isMe 
                    ? "bg-[#d9fdd3] rounded-lg rounded-tr-none" 
                    : "bg-white rounded-lg rounded-tl-none"
                }\`}
              >
                <div className="text-[#111b21] leading-snug break-words" style={{ paddingRight: isMe ? '4rem' : '3rem', paddingBottom: '0.25rem' }}>
                  {msg.content}
                </div>
                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                  <span className="text-[11px] text-[#667781] font-medium leading-none">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <CheckCheck className={\`w-[15px] h-[15px] -ml-0.5 \${readReceiptsUnlocked ? 'text-[#53bdeb]' : 'text-[#8696a0]'}\`} />
                  )}
                </div>
              </div>
            </div>
          );
        })}`;
code = code.replace(oldMessagesRegex, newMessages);

// 4. Replace Typing Indicator
const oldTypingRegex = /\{isTyping && \([\s\S]*?\}\)/;
const newTyping = `{isTyping && (
          <div className="flex w-full justify-start mb-1.5">
            <div className="bg-white rounded-lg rounded-tl-none px-4 py-2 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] text-[#667781] text-sm font-medium italic">
              typing...
            </div>
          </div>
        )}`;
code = code.replace(oldTypingRegex, newTyping);

// 5. Replace Input Area
const oldInputAreaRegex = /\{\/\* Input Area \*\/\}.*?\<\/form\>\n\s*\<\/div\>\n\s*\)\}\n\s*\<\/div\>/s;
const newInputArea = `{/* Input Area */}
      {(!job || (job.status !== 'COMPLETED' && job.status !== 'ABANDONED' && job.status !== 'DELETED')) && (
        <div className="bg-[#F0F2F5] p-2 sm:p-3 shrink-0 pb-[max(env(safe-area-inset-bottom),8px)] z-50">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-2">
            <div className="flex-1 bg-white rounded-[24px] flex items-center shadow-sm min-h-[44px] px-4">
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
                placeholder="Message"
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
              className="w-11 h-11 bg-[#00A884] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm active:scale-95 disabled:opacity-0 disabled:scale-75 transition-all duration-200 ease-out"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </div>`;

code = code.replace(oldInputAreaRegex, newInputArea);

fs.writeFileSync(file, code);
