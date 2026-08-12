"use client";

import { useState } from "react";

// Mock Data
const MOCK_MESSAGES = [
  { id: 1, sender: "provider", text: "Hey! I can help you move the boxes.", time: "10:00 AM" },
  { id: 2, sender: "requester", text: "Awesome! I'm in Room 302.", time: "10:05 AM" },
  { id: 3, sender: "provider", text: "I'm outside.", time: "10:15 AM" },
];

export default function ChatView() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  
  // State Machine for the Handshake
  const [isRequester] = useState(true); // Mocking as Requester
  const [requesterPaid, setRequesterPaid] = useState(false);
  const [providerReceived, setProviderReceived] = useState(false);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: isRequester ? "requester" : "provider", text: newMessage, time: "Now" }]);
    setNewMessage("");
  };

  const handleHandshake = async () => {
    // Calling the Supabase RPC: process_payment_handshake
    if (isRequester) {
      setRequesterPaid(true);
    } else {
      setProviderReceived(true);
    }
    // Simulation:
    alert(isRequester ? "You marked as Paid & Received." : "You confirmed payment.");
  };

  const isCompleted = requesterPaid && providerReceived;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto bg-gray-50 border-x border-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Need help moving out of dorm</h2>
          <p className="text-sm text-gray-500">Chatting with @ProviderName</p>
        </div>
        <div className="text-right">
          <span className="block font-bold text-green-600">₹300</span>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md mt-1 inline-block font-medium">IN PROGRESS</span>
        </div>
      </div>

      {/* Handshake Banner */}
      {!isCompleted && (
        <div className="bg-yellow-50 border-b border-yellow-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-yellow-800 font-medium">
            {isRequester 
              ? "Once the service is done and you've paid them directly (UPI/Cash), confirm below." 
              : "Wait for the requester to pay you directly, then confirm."}
          </p>
          <button 
            onClick={handleHandshake}
            disabled={isRequester ? requesterPaid : providerReceived}
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold shadow-sm transition-colors ${
              (isRequester ? requesterPaid : providerReceived)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isRequester 
              ? (requesterPaid ? "Waiting for Provider..." : "Mark as Received & Paid")
              : (providerReceived ? "Confirmed." : "Confirm Payment Received")}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="bg-green-50 border-b border-green-200 p-4 text-center">
          <p className="text-green-800 font-bold">✅ Job Completed! The 7-Day privacy timer has started.</p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="text-center text-xs text-gray-400 mb-6 font-medium bg-white py-1 px-3 rounded-full mx-auto inline-block border border-gray-100 shadow-sm">
          No media sharing allowed. Protect your privacy.
        </div>
        
        {messages.map(msg => {
          const isMe = (isRequester && msg.sender === "requester") || (!isRequester && msg.sender === "provider");
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-xs text-gray-400 mt-1 mx-1">{msg.time}</span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isCompleted}
            placeholder={isCompleted ? "Chat is closed." : "Type a message..."} 
            className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button 
            type="submit"
            disabled={isCompleted || !newMessage.trim()}
            className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
