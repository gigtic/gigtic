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
    const textarea = document.getElementById("chat-input") as HTMLTextAreaElement;
    if (textarea) textarea.style.height = "auto";
    
    
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
    <div className="fixed top-[56px] md:top-[64px] bottom-0 left-0 right-0 flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full z-40 overflow-hidden">
      
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b-2 border-indigo-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <Link href={dmParam ? "/chat" : (isRequester && conversationParam ? `/chat?job=${jobId}` : `/job/${jobId}`)} className="p-2 mr-2 -ml-2 text-indigo-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 transform hover:scale-105 transition-transform">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 leading-tight">
              {dmParam ? `Chat with ${conversation?.requester_id === currentUser?.id ? conversation?.worker?.username : conversation?.requester?.username}` : (isRequester ? `Chat with ${conversation?.worker?.username}` : job?.title)}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              {dmParam ? "Direct Message" : `₹${job?.budget_amount} • ${job?.status}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isRequester && !dmParam && (
            <button 
              onClick={() => handleAddFriend(job?.requester_id)}
              className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 transition-all shadow-sm"
              title="Add Friend"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}

          {isRequester && job?.status === 'OPEN' && (
            <button 
              onClick={handleAssignGig}
              className="px-6 py-2.5 rounded-2xl font-black text-sm bg-indigo-500 text-white hover:bg-indigo-400 active:scale-95 transition-all shadow-lg shadow-indigo-200"
            >
              Assign to this User
            </button>
          )}

          {isProvider && job?.status === 'IN_PROGRESS' && (
            <button 
              onClick={handleDropGig}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all"
            >
              Drop Gig
            </button>
          )}
          
          {(isRequester || isProvider) && job?.status === 'IN_PROGRESS' && (
            <button 
              onClick={handleHandshake}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                (isRequester && job.requester_marked_paid) || (!isRequester && job.provider_marked_received)
                  ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                  : "bg-black text-white hover:bg-gray-900 active:scale-95 shadow-black/10"
              }`}
            >
              {(isRequester && job.requester_marked_paid) || (!isRequester && job.provider_marked_received) ? (
                <><CheckCircle2 className="w-4 h-4" /> Waiting for other party</>
              ) : (
                <><Handshake className="w-4 h-4" /> {isRequester ? "Mark as Paid" : "Mark as Received"}</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1.5 bg-[#FAFAFA] scroll-smooth relative" style={{ touchAction: 'pan-y' }}>
        <div className="flex justify-center my-6">
          <div className="bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2 shadow-sm">
            Keep all negotiations on campus.
          </div>
        </div>

        {/* Discreet Ad Placement: At the top of the chat history so it scrolls out of view naturally */}

        {!readReceiptsUnlocked && messages.length > 0 && (
          <div className="flex justify-center my-4">
            <PremiumUnlockButton 
              title="Unlock Read Receipts"
              description="See exactly when your messages are read with blue double-checkmarks. Instantly active for all your chats!"
              buttonText="Unlock Read Receipts"
              onUnlock={handleUnlockReceipts}
              className="max-w-md w-full"
            />
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isMe ? "You" : msg.sender?.username || "User"}
              </span>
              <div 
                className={`max-w-[75%] px-5 py-3.5 text-sm font-medium shadow-sm transition-all ${
                  isMe 
                    ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-[24px] rounded-br-sm shadow-md shadow-indigo-200/50" 
                    : "bg-white text-gray-800 border-2 border-indigo-50 rounded-[24px] rounded-bl-sm shadow-sm"
                }`}
              >
                {msg.content}
              </div>
              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                <span className="text-[10px] font-bold text-gray-300">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && (
                  readReceiptsUnlocked ? (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5 text-gray-300" />
                  )
                )}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-start group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white text-gray-500 border border-gray-100 rounded-3xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
              <span className="text-gray-500 text-sm font-medium italic">✍️ Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="scroll-m-[150px]" />
      </div>

      {/* Input Area */}
      {(!job || (job.status !== 'COMPLETED' && job.status !== 'ABANDONED' && job.status !== 'DELETED')) && (
        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/60 p-3 sm:p-4 shrink-0 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.03)] z-50">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end">
            <div className="flex-1 bg-white border border-gray-200/80 rounded-3xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm flex items-center pr-1.5 pl-1.5 min-h-[48px]">
              <textarea id="chat-input"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  
                  // Auto-grow logic
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';

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
                placeholder="Type a message..."
                className="w-full bg-transparent px-5 py-3 outline-none text-gray-900 text-[15px] resize-none min-h-[46px] max-h-32 self-center pt-[12px] leading-relaxed"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      e.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
                onBlur={() => {
                  // iOS Safari keyboard dismissal bug fix: force layout recalculation
                  setTimeout(() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }, 100);
                }}
              />
            
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="w-[36px] h-[36px] bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:bg-gray-300 transition-all shadow-sm active:scale-90 shrink-0 self-end mb-[5px] mr-[2px]"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="w-10 h-10 animate-spin text-gray-300" /></div>}>
      <style dangerouslySetInnerHTML={{__html: `
        html, body {
          padding-bottom: 0px !important;
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
          touch-action: none !important;
        }
      `}} />
      <ChatContent />
    </Suspense>
  );
}
