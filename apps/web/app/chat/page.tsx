"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, CheckCircle2, ShieldCheck, Clock, Check, Loader2, ArrowLeft } from "lucide-react";

export default function ChatView() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchJobs(user.id);
    }
  };

  const fetchJobs = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase.from('jobs')
      .select('*')
      .or(`requester_id.eq.${userId},provider_id.eq.${userId}`)
      .in('status', ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'])
      .order('created_at', { ascending: false });
    
    if (data) setActiveJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedJob || !user) return;

    supabase.from('messages')
      .select('*')
      .eq('job_id', selectedJob.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []));

    const channel = supabase.channel(`job_${selectedJob.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${selectedJob.id}` }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedJob, user, supabase]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedJob || !user) return;
    
    const msg = newMessage;
    setNewMessage("");
    
    await supabase.from('messages').insert({
      job_id: selectedJob.id,
      sender_id: user.id,
      content: msg
    });
  };

  const handleHandshake = async () => {
    if (!selectedJob || !user) return;

    if (selectedJob.status === 'ASSIGNED') {
       await supabase.from('jobs').update({ status: 'IN_PROGRESS' }).eq('id', selectedJob.id);
    }

    const { data, error } = await supabase.rpc('process_payment_handshake', {
      p_job_id: selectedJob.id,
      p_user_id: user.id
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      fetchJobs(user.id);
      const updatedJob = await supabase.from('jobs').select('*').eq('id', selectedJob.id).single();
      if (updatedJob.data) setSelectedJob(updatedJob.data);
    }
  };

  if (!user || loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] max-w-7xl mx-auto bg-white border-x border-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar: Job List */}
      <div className={`${selectedJob ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-gray-100 bg-[#FAFAFA]`}>
        <div className="p-6 border-b border-gray-100 bg-white">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Active Gigs</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {activeJobs.length === 0 ? (
            <div className="p-8 text-center text-sm font-medium text-gray-500">
              No active gigs yet. Accept one in Explore!
            </div>
          ) : (
            activeJobs.map((job) => {
              const isRequester = job.requester_id === user.id;
              const isSelected = selectedJob?.id === job.id;
              
              return (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job)}
                  className={`p-5 border-b border-gray-100 cursor-pointer transition-all duration-200 group ${isSelected ? 'bg-white border-l-4 border-black' : 'hover:bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold truncate pr-4 ${isSelected ? 'text-black' : 'text-gray-900 group-hover:text-black'}`}>
                      {job.title}
                    </h3>
                    <span className="text-sm font-black text-gray-900">₹{job.budget_amount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100/80 px-2.5 py-1 rounded-md">
                      {isRequester ? 'Hiring' : 'Working'}
                    </span>
                    
                    <span className={`text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full ${
                      job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                      job.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedJob ? (
        <div className="flex-1 flex flex-col bg-white">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedJob(null)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-black transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="font-bold text-gray-900 text-lg leading-tight">{selectedJob.title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-gray-500">
                    Role: {selectedJob.requester_id === user.id ? "Requester" : "Provider"}
                  </span>
                  <span className="text-[10px] text-gray-300">•</span>
                  <span className="text-xs font-bold text-gray-900">₹{selectedJob.budget_amount}</span>
                </div>
              </div>
            </div>
            
            <button className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </button>
          </div>

          {/* Handshake Banner */}
          {selectedJob.status !== 'COMPLETED' && (
            <div className="bg-yellow-50 border-b border-yellow-200/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-sm text-yellow-800 font-medium leading-relaxed">
                  {selectedJob.requester_id === user.id 
                    ? "When service is done, pay directly via UPI/Cash, then click confirm." 
                    : "Complete the job, collect payment via UPI/Cash, then click confirm."}
                </p>
              </div>
              
              <button 
                onClick={handleHandshake}
                disabled={(selectedJob.requester_id === user.id && selectedJob.requester_marked_paid) || (selectedJob.provider_id === user.id && selectedJob.provider_marked_received)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm bg-black text-white hover:bg-gray-900 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {selectedJob.requester_id === user.id 
                  ? (selectedJob.requester_marked_paid ? <><Check className="w-4 h-4" /> Waiting for Provider</> : "Mark as Paid")
                  : (selectedJob.provider_marked_received ? <><Check className="w-4 h-4" /> Confirmed</> : "Confirm Payment Received")}
              </button>
            </div>
          )}

          {selectedJob.status === 'COMPLETED' && (
            <div className="bg-green-50 border-b border-green-200/60 p-5 flex items-center justify-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-bold">Job Completed! 7-Day privacy timer has started.</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAFA]">
            <div className="text-center text-xs text-gray-500 font-semibold bg-white py-1.5 px-4 rounded-full mx-auto inline-flex items-center justify-center border border-gray-200 shadow-sm max-w-xs">
              End-to-end Chat • No media allowed.
            </div>
            
            {messages.map(msg => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[75%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-black text-white rounded-br-sm' 
                      : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 mt-1.5 mx-2">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-100 p-4 sm:p-5">
            <form onSubmit={sendMessage} className="flex gap-3 max-w-4xl mx-auto">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={selectedJob.status === 'COMPLETED'}
                placeholder={selectedJob.status === 'COMPLETED' ? "This chat is permanently closed." : "Type a message..."} 
                className="flex-1 bg-gray-50/80 border border-gray-200 rounded-2xl px-6 py-4 font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              />
              <button 
                type="submit"
                disabled={selectedJob.status === 'COMPLETED' || !newMessage.trim()}
                className="bg-black text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-gray-900 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md shadow-black/10 shrink-0"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </form>
          </div>
          
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-white text-center p-8">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 border border-gray-100">
            <ShieldCheck className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your Workspace</h3>
          <p className="text-gray-500 font-medium max-w-xs">Select a gig from the sidebar to coordinate logistics safely and securely.</p>
        </div>
      )}
    </div>
  );
}
