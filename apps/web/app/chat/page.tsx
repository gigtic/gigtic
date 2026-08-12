"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { Send, Handshake, CheckCircle2, User, Loader2 } from "lucide-react";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    if (jobId) {
      loadChat();
    }
  }, [jobId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      // Fetch Job Details
      const { data: jobData } = await supabase
        .from("jobs")
        .select("*, requester:requester_id(nickname), provider:provider_id(nickname)")
        .eq("id", jobId)
        .single();
        
      setJob(jobData);

      // Fetch Messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*, sender:sender_id(nickname)")
        .eq("job_id", jobId)
        .order("created_at", { ascending: true });
        
      setMessages(msgs || []);

      // Subscribe to real-time messages
      const subscription = supabase
        .channel(`chat_${jobId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${jobId}` },
          async (payload) => {
            // Fetch sender nickname for the new message
            const { data: senderData } = await supabase.from('users').select('nickname').eq('id', payload.new.sender_id).single();
            const fullMessage = { ...payload.new, sender: senderData };
            setMessages((prev) => [...prev, fullMessage]);
          }
        )
        .subscribe();

      setLoading(false);
      
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !jobId) return;

    const content = newMessage;
    setNewMessage(""); // Optimistic UI clear

    await supabase.from("messages").insert({
      job_id: jobId,
      sender_id: currentUser.id,
      content: content
    });
  };

  const handleHandshake = async () => {
    if (!currentUser || !jobId) return;
    
    // Call the RPC we created in the schema
    const { data, error } = await supabase.rpc('process_payment_handshake', {
      p_job_id: jobId,
      p_user_id: currentUser.id
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(data.message);
      // Reload job to update UI state
      loadChat();
    }
  };

  if (!jobId) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[#FAFAFA] font-sans">
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Chat Selected</h2>
        <p className="text-gray-500 font-medium">Please select a gig from the Explore feed to start chatting.</p>
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
  
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#FAFAFA] font-sans max-w-5xl mx-auto w-full">
      
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 leading-tight">{job?.title}</h2>
            <p className="text-sm font-medium text-gray-500">
              ₹{job?.budget_amount} • {job?.status}
            </p>
          </div>
        </div>

        {/* Payment Handshake Button */}
        {job?.status === 'IN_PROGRESS' && (
          <button 
            onClick={handleHandshake}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
              (isRequester && job.requester_marked_paid) || (!isRequester && job.provider_marked_received)
                ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                : "bg-black text-white hover:bg-gray-900 active:scale-95 shadow-md shadow-black/10"
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAFA] scroll-smooth">
        
        {/* System Welcome Message */}
        <div className="flex justify-center my-6">
          <div className="bg-blue-50 text-blue-800 text-xs font-bold px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Keep all negotiations and payments on campus.
          </div>
        </div>

        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-xs font-bold text-gray-400 mb-1 px-1">
                {isMe ? "You" : msg.sender?.nickname || "User"}
              </span>
              <div 
                className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm font-medium shadow-sm ${
                  isMe 
                    ? "bg-black text-white rounded-br-sm" 
                    : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] font-semibold text-gray-300 mt-1 px-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shrink-0 pb-8 sm:pb-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-black focus-within:ring-2 focus-within:ring-black/5 transition-all">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent px-4 py-3.5 outline-none text-gray-900 font-medium resize-none min-h-[52px] max-h-32"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-14 h-[52px] bg-black text-white rounded-2xl flex items-center justify-center hover:bg-gray-900 disabled:opacity-50 transition-all shadow-md shadow-black/10 active:scale-95 shrink-0"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Dummy shield icon for the system message
function Shield(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
