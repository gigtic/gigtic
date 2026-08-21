"use client";
import React from "react";

import { useEffect, useState, useRef, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, Handshake, CheckCircle2, CheckCheck, User, Loader2, Star, AlertTriangle, ArrowLeft, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import AdsterraUnit from "@/components/AdsterraUnit";
import PremiumUnlockButton from "@/components/PremiumUnlockButton";

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("job");
  const conversationParam = searchParams.get("conv");
  const dmParam = searchParams.get("dm");
  
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [conversationsList, setConversationsList] = useState<any[]>([]);
  const [globalConversations, setGlobalConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [readReceiptsUnlocked, setReadReceiptsUnlocked] = useState(false);
  
  const broadcastChannelRef = useRef<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEventRef = useRef<number>(0);

  const supabase = createClient();

  useEffect(() => {
    loadChatData();
    
    if (jobId) {
      const jobChannel = supabase.channel(`job_${jobId}_${Math.random().toString(36).substring(7)}`).on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` },
        async () => {
          // Fetch the updated job to get the joined fields
          const { data: updatedJob } = await supabase
            .from("jobs")
            .select("*, requester:requester_id(username), provider:provider_id(username)")
            .eq("id", jobId)
            .single();
          if (updatedJob) setJob(updatedJob);
        }
      ).subscribe();
    }

    // Cleanup subscriptions on unmount or when params change
    return () => {
      supabase.getChannels().forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [jobId, conversationParam, dmParam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatData = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    
    if (user) {
      const isUnlocked = localStorage.getItem(`read_receipts_${user.id}`) === 'true';
      setReadReceiptsUnlocked(isUnlocked);
    }

    if (user) {
      if (!jobId && !dmParam) {
        // Global Inbox View
        const { data: convs, error: inboxError } = await supabase
          .from("conversations")
          .select("*, job:job_id(title, status), requester:requester_id(id, username), worker:worker_id(id, username)")
          .or(`requester_id.eq.${user.id},worker_id.eq.${user.id}`)
          .order("created_at", { ascending: false });
          
        if (inboxError) console.error("Inbox Error:", inboxError);
        
        setGlobalConversations(convs || []);
        if (!silent) setLoading(false);
        return;
      }

      if (dmParam) {
        // Direct Message mode
        let { data: conv } = await supabase
          .from("conversations")
          .select("*, requester:requester_id(username), worker:worker_id(username)")
          .eq("is_dm", true)
          .or(`and(requester_id.eq.${user.id},worker_id.eq.${dmParam}),and(requester_id.eq.${dmParam},worker_id.eq.${user.id})`)
          .single();
          
        if (!conv) {
          const { data: newConv, error: insertErr } = await supabase.from("conversations").insert({
            requester_id: user.id,
            worker_id: dmParam,
            is_dm: true
          }).select("*, requester:requester_id(username), worker:worker_id(username)").single();
          
          if (insertErr && insertErr.code === '23505') {
             // Race condition: conversation was just created by another render
             const { data: existingConv } = await supabase
               .from("conversations")
               .select("*, requester:requester_id(username), worker:worker_id(username)")
               .eq("is_dm", true)
               .or(`and(requester_id.eq.${user.id},worker_id.eq.${dmParam}),and(requester_id.eq.${dmParam},worker_id.eq.${user.id})`)
               .single();
             conv = existingConv;
          } else {
             conv = newConv;
          }
        }
        
        setConversation(conv);
        if (conv) await loadMessages(conv.id, user.id);
        if (!silent) setLoading(false);
        return;
      }
      
      // Fetch Job Details
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*, requester:requester_id(username), provider:provider_id(username)")
        .eq("id", jobId)
        .single();
        
      if (jobError) console.error("Job Fetch Error:", jobError);
        
      setJob(jobData);

      const isReq = user.id === jobData.requester_id;

      if (isReq) {
        if (conversationParam) {
          // Load specific conversation
          const { data: conv } = await supabase
            .from("conversations")
            .select("*, worker:worker_id(username)")
            .eq("id", conversationParam)
            .single();
          setConversation(conv);
          if (conv) await loadMessages(conv.id, user.id);
        } else {
          // Load list of conversations (Inbox view)
          const { data: convs } = await supabase
            .from("conversations")
            .select("*, worker:worker_id(username)")
            .eq("job_id", jobId);
          setConversationsList(convs || []);
        }
      } else {
        // Worker view: Find or create conversation
        let { data: conv, error: findConvError } = await supabase
          .from("conversations")
          .select("*, worker:worker_id(username)")
          .eq("job_id", jobId)
          .eq("worker_id", user.id)
          .single();
          
        if (findConvError && findConvError.code !== 'PGRST116') {
          console.error("Find Conversation Error:", findConvError);
        }
        
        if (!conv) {
          const { data: newConv, error: insertConvError } = await supabase.from("conversations").insert({
            job_id: jobId,
            requester_id: jobData.requester_id,
            worker_id: user.id
          }).select("*, worker:worker_id(username)").single();
          
          if (insertConvError && insertConvError.code === '23505') {
            const { data: existingConv } = await supabase
              .from("conversations")
              .select("*, worker:worker_id(username)")
              .eq("job_id", jobId)
              .eq("worker_id", user.id)
              .single();
            conv = existingConv;
          } else {
            if (insertConvError) {
              console.error("Insert Conversation Error:", JSON.stringify(insertConvError, null, 2));
              toast.error("Error creating chat: " + (insertConvError.message || JSON.stringify(insertConvError)));
            }
            conv = newConv;
          }
        }
        
        setConversation(conv);
        if (conv) await loadMessages(conv.id, user.id);
      }
    }
    if (!silent) setLoading(false);
  };

  const loadMessages = async (convId: string, currentUserId: string) => {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*, sender:sender_id(username)")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
      
    setMessages(msgs || []);

    // Subscribe to real-time messages and typing indicators
    const channelName = `chat_room_${convId}`;
    const channel = supabase.channel(channelName);
    broadcastChannelRef.current = channel;

    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
      async (payload) => {
        if (payload.new.sender_id !== currentUserId) {
          setIsTyping(false);
        }
        const { data: senderData } = await supabase.from('users').select('username').eq('id', payload.new.sender_id).single();
        setMessages((prev) => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, { ...payload.new, sender: senderData }];
        });
      }
    )
    .on(
      'broadcast',
      { event: 'typing' },
      (payload) => {
        if (payload.payload.userId !== currentUserId) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    )
    .subscribe();
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !conversation || isSubmitting) return;
    
    setIsSubmitting(true);
    const content = newMessage;
    setNewMessage("");
    
    
    const { error: msgErr } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: currentUser.id,
      content: content
    });
    
    if (!msgErr) {
      const otherUserId = conversation.requester_id === currentUser.id ? conversation.worker_id : conversation.requester_id;
      const myUsername = conversation.requester_id === currentUser.id ? conversation.requester?.username : conversation.worker?.username;
      
      await supabase.from("notifications").insert({
        user_id: otherUserId,
        type: `chat_message|/chat?job=${jobId || ''}&conv=${conversation?.id || ''}${dmParam ? '&dm=' + dmParam : ''}`, // Inject link into type
        message: `💬 New message from @${myUsername || 'someone'}`
      });
    }

    
    setIsSubmitting(false);
  };

  const handleUnlockReceipts = () => {
    if (!currentUser) return;
    localStorage.setItem(`read_receipts_${currentUser.id}`, 'true');
    setReadReceiptsUnlocked(true);
  };

  const handleAssignGig = async () => {
    if (!currentUser || !jobId || !conversation) return;
    const { error } = await supabase.from("jobs").update({ status: 'IN_PROGRESS', provider_id: conversation.worker_id }).eq("id", jobId);
    if (error) {
      toast.error("Error assigning gig: " + error.message);
    } else {
      
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        content: "I have assigned this gig to you! Let's get started."
      });
      
      await supabase.from("notifications").insert({
        user_id: conversation.worker_id,
        type: `gig_assigned|/chat?job=${jobId}&conv=${conversation?.id}`, // Inject link into type
        message: `🎉 You have been assigned to a gig!`
      });

      toast.success("Gig assigned successfully!");
      setJob((prev: any) => ({ ...prev, status: "IN_PROGRESS", provider_id: conversation.worker_id }));
      loadChatData(true);
    }
  };

  const handleDropGig = async () => {
    if (!currentUser || !jobId || !conversation) return;
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-1">
          <p className="font-bold text-gray-900">Are you sure you want to drop this gig? This will notify the creator.</p>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors"
              onClick={async () => {
                toast.dismiss(t.id);
                const { error } = await supabase.from("jobs").update({ status: 'ABANDONED', provider_id: null }).eq("id", jobId);
                if (!error) {
                  await supabase.from("notifications").insert({
                    user_id: job.requester_id,
                    type: `gig_dropped|/chat?job=${jobId}&conv=${conversation?.id}`, // Inject link into type
                    message: `The worker has abandoned your gig: ${job.title}`,
                    job_id: jobId
                  });
                  
                  await supabase.from("messages").insert({
                    conversation_id: conversation.id,
                    sender_id: currentUser.id,
                    content: "I have dropped this gig. Sorry for the inconvenience."
                  });
                  
                  await supabase.from("notifications").insert({
                    user_id: conversation.requester_id,
                    type: `gig_dropped|/chat?job=${jobId}&conv=${conversation?.id}`, // Inject link into type
                    message: `⚠️ The assigned worker has dropped your gig.`
                  });

                  toast.success("Gig dropped successfully!");
                  setJob((prev: any) => ({ ...prev, status: "ABANDONED", provider_id: null }));
                  loadChatData(true);
                }
              }}
            >
              Drop Gig
            </button>
            <button 
              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-lg font-bold text-sm hover:bg-gray-300 transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, style: { maxWidth: 400 } }
    );
  };

  const handleRepost = async () => {
    await supabase.from("jobs").update({ status: 'OPEN' }).eq("id", jobId);
    loadChatData(true);
  };

  const handleTerminate = async () => {
    await supabase.from("jobs").update({ status: 'DELETED' }).eq("id", jobId);
    router.push('/explore');
  };

  const handleHandshake = async () => {
    if (!currentUser || !jobId) return;
    
    const { data, error } = await supabase.rpc('process_payment_handshake', { p_job_id: jobId, p_user_id: currentUser.id });
    if (error) toast.error("Error: " + error.message);
    else {
      toast.success(data.message);
      
      const otherUserId = conversation.requester_id === currentUser.id ? conversation.worker_id : conversation.requester_id;
      await supabase.from("notifications").insert({
        user_id: otherUserId,
        type: `gig_handshake|/chat?job=${jobId}&conv=${conversation?.id}`, // Inject link into type
        message: `🤝 ${data.status === 'COMPLETED' ? 'The gig is now COMPLETED!' : 'The other party has confirmed their part of the gig!'}`
      });
      
      if (currentUser.id === job.requester_id) setJob((prev: any) => ({ ...prev, requester_marked_paid: true }));
      else setJob((prev: any) => ({ ...prev, provider_marked_received: true }));
      if (data.status === 'COMPLETED') setJob((prev: any) => ({ ...prev, status: 'COMPLETED' }));
      
      loadChatData(true);
    }

  };

  const handleAddFriend = async (friendId: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('friendships').insert({
      requester_id: currentUser.id,
      addressee_id: friendId,
      status: 'PENDING'
    });
    if (error) {
      if (error.code === '23505') toast.error("Friend request already sent!");
      else toast.error("Error: " + error.message);
    } else {
      toast.success("Friend request sent! They can accept it in their Friends tab.");
    }
  };

  if (!jobId && !dmParam) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] font-sans max-w-3xl mx-auto w-full p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900">All Chats</h1>
          <Link href="/friends" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-2xl font-black text-sm hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95">
            <UserPlus className="w-4 h-4" /> New Chat
          </Link>
        </div>
        <div className="space-y-4">
          {globalConversations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">You have no active chats.</p>
            </div>
          ) : (
            globalConversations.map((conv, index) => {
              const isCreator = currentUser?.id === conv.requester_id;
              const otherPerson = isCreator ? conv.worker : conv.requester;
              return (
                <React.Fragment key={conv.id}>
                  {index === 2 && (
                    <div className="py-2">
                      <AdsterraUnit />
                    </div>
                  )}
                  <Link 
                    key={conv.id} 
                  href={conv.is_dm ? `/chat?dm=${otherPerson?.id}` : `/chat?job=${conv.job_id}&conv=${conv.id}`}
                  className="flex items-center gap-4 bg-white border-2 border-indigo-50 p-5 rounded-[24px] shadow-sm hover:border-indigo-200 hover:shadow-md hover:-translate-y-1 transition-all group duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {conv.is_dm ? `Direct Message with ${otherPerson?.username}` : conv.job?.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {conv.is_dm ? "Friends" : (isCreator ? "Chatting with" : "Job by")} {!conv.is_dm && otherPerson?.username}
                    </p>
                  </div>
                  {!conv.is_dm && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded-full tracking-wider">
                        {conv.job?.status}
                      </span>
                    </div>
                  )}
                </Link>
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    );
  }

  const isRequester = currentUser?.id === job?.requester_id;
  const isProvider = currentUser?.id === job?.provider_id;
  
  // INBOX VIEW (For Requester seeing all interested workers)
  if (isRequester && !conversationParam) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] font-sans max-w-3xl mx-auto w-full p-6">
        <h1 className="text-3xl font-black text-gray-900 mb-2">{job.title}</h1>
        <div className="flex items-center gap-3 mb-8">
          <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-bold uppercase">{job.status}</span>
          <span className="text-gray-500 font-medium">Interested Workers</span>
        </div>
        
        {job.status === 'ABANDONED' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex flex-col items-center text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
            <h3 className="text-lg font-bold text-red-900 mb-1">Gig Abandoned</h3>
            <p className="text-red-700 text-sm mb-6">The worker assigned to this gig has dropped it mid-way.</p>
            <div className="flex gap-4">
              <button onClick={handleRepost} className="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all">Repost Gig</button>
              <button onClick={handleTerminate} className="px-6 py-2.5 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-all">Terminate</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {conversationsList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">No one has messaged about this gig yet.</p>
            </div>
          ) : (
            conversationsList.map(conv => (
              <Link 
                key={conv.id} 
                href={`/chat?job=${jobId}&conv=${conv.id}`}
                className="flex items-center gap-4 bg-white border-2 border-indigo-50 p-5 rounded-[24px] shadow-sm hover:border-indigo-200 hover:shadow-md hover:-translate-y-1 transition-all group duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Chat with {conv.worker?.username}</h3>
                  <p className="text-sm text-gray-500">Started {new Date(conv.created_at).toLocaleDateString()}</p>
                </div>
                {job.provider_id === conv.worker_id && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Hired</span>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    );
  }

  // CHAT ROOM VIEW
  return (
    <div className="fixed inset-0 md:relative md:inset-auto z-40 pt-[56px] md:pt-0 h-[100dvh] md:h-[calc(100vh-64px)] flex flex-col bg-[#EFEAE2] font-sans max-w-5xl mx-auto w-full">
      
      {/* WhatsApp Style Header */}
      <div className="bg-[#F0F2F5] border-b border-gray-200/60 px-2 py-2 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Link href={dmParam ? "/chat" : (isRequester && conversationParam ? `/chat?job=${jobId}` : `/job/${jobId}`)} className="p-2 -ml-1 text-[#54656f] hover:bg-black/5 active:bg-black/10 rounded-full transition-colors flex items-center gap-1">
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
              {dmParam ? "online" : `₹${job?.budget_amount} • ${job?.status}`}
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
            <button onClick={handleHandshake} className={`p-2 rounded-full transition-all shadow-sm ${(isRequester && job.requester_marked_paid) || (!isRequester && job.provider_marked_received) ? "bg-[#d9fdd3] text-[#111b21]" : "bg-[#00A884] text-white active:scale-95"}`}>
              <Handshake className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-1.5 bg-[#EFEAE2] scroll-smooth" style={{}}>
        
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
            <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-[2px]`}>
              <div 
                className={`relative max-w-[85%] sm:max-w-[70%] px-2.5 py-1.5 text-[15px] shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${
                  isMe 
                    ? "bg-[#d9fdd3] rounded-lg rounded-tr-none" 
                    : "bg-white rounded-lg rounded-tl-none"
                }`}
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
                    <CheckCheck className={`w-[15px] h-[15px] ${readReceiptsUnlocked ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} />
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
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="w-10 h-10 animate-spin text-gray-300" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
