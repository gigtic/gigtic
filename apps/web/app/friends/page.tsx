"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, CheckCircle2, XCircle, Clock, Loader2, MessageSquare, Search, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function FriendsContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    if (!user) return;

    if (activeTab === 'friends') {
      const { data } = await supabase
        .from('friendships')
        .select(`
          id, 
          status,
          requester:requester_id(id, username, trust_score), 
          addressee:addressee_id(id, username, trust_score)
        `)
        .eq('status', 'ACCEPTED')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      setFriends(data || []);
    } else if (activeTab === 'requests') {
      const { data } = await supabase
        .from('friendships')
        .select(`
          id, 
          requester:requester_id(id, username, trust_score)
        `)
        .eq('status', 'PENDING')
        .eq('addressee_id', user.id); // Only requests sent to me
      setRequests(data || []);
    } else if (activeTab === 'search') {
      // Don't auto-fetch anything for search tab
      setSearchResults([]);
      setSearchQuery("");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab !== 'search') return;
    
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() && currentUser) {
        executeSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab, currentUser]);

  const executeSearch = async (query: string) => {
    setSearching(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, username, real_name, trust_score')
      .neq('id', currentUser.id)
      .or(`username.ilike.%${query.trim()}%,real_name.ilike.%${query.trim()}%`)
      .limit(10);
      
    if (error) toast.error("Search Error: " + error.message);
    setSearchResults(data || []);
    setSearching(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !currentUser) return;
    executeSearch(searchQuery);
  };

  const handleSendRequest = async (friendId: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('friendships').insert({
      requester_id: currentUser.id,
      addressee_id: friendId,
      status: 'PENDING'
    });
    
    if (error) {
      if (error.code === '23505') toast.error("You have already sent a request or are already friends!");
      else toast.error("Error: " + error.message);
    } else {
      toast.success("Friend request sent!");
    }
  };

  const handleAccept = async (id: string) => {
    await supabase.from('friendships').update({ status: 'ACCEPTED' }).eq('id', id);
    loadData();
  };

  const handleReject = async (id: string) => {
    await supabase.from('friendships').delete().eq('id', id);
    loadData();
  };

  const handleStartDM = async (friendId: string) => {
    router.push(`/chat?dm=${friendId}`);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 font-sans max-w-4xl mx-auto w-full p-6">
      <h1 className="text-3xl font-black text-slate-800 mb-8">Connections</h1>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('friends')}
          className={`px-6 py-2 rounded-2xl font-extrabold text-sm transition-all ${activeTab === 'friends' ? 'bg-white text-black shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'text-slate-500 hover:text-black'}`}
        >
          My Friends
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-2 rounded-2xl font-extrabold text-sm transition-all ${activeTab === 'requests' ? 'bg-white text-black shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'text-slate-500 hover:text-black'}`}
        >
          Friend Requests
        </button>
        <button 
          onClick={() => setActiveTab('search')}
          className={`px-6 py-2 rounded-2xl font-extrabold text-sm transition-all ${activeTab === 'search' ? 'bg-white text-black shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'text-slate-500 hover:text-black'}`}
        >
          Find Friends
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : activeTab === 'friends' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.length === 0 ? (
             <div className="col-span-full text-center py-16 bg-white rounded-3xl border-2 border-indigo-50/50">
               <p className="text-slate-500 font-medium">You haven't added any friends yet.</p>
             </div>
          ) : (
            friends.map(f => {
              const friendUser = f.requester.id === currentUser.id ? f.addressee : f.requester;
              return (
                <div key={f.id} className="bg-white border-2 border-indigo-50/50 p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                    <Link href={`/user/${friendUser.id}`} className="font-extrabold text-slate-800 hover:text-blue-600 transition-colors">
                      {friendUser.username}
                    </Link>
                    <p className="text-xs font-extrabold text-gray-400">Trust Score: {friendUser.trust_score}</p>
                  </div>
                  </div>
                  <button onClick={() => handleStartDM(friendUser.id)} className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === 'requests' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.length === 0 ? (
             <div className="col-span-full text-center py-16 bg-white rounded-3xl border-2 border-indigo-50/50">
               <p className="text-slate-500 font-medium">No pending friend requests.</p>
             </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-white border-2 border-indigo-50/50 p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <Link href={`/user/${req.requester.id}`} className="font-extrabold text-slate-800 hover:text-blue-600 transition-colors">
                      {req.requester.username}
                    </Link>
                    <p className="text-xs font-extrabold text-slate-500">Wants to connect</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(req.id)} className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleReject(req.id)} className="w-10 h-10 rounded-full bg-red-50 text-rose-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 bg-white border border-indigo-100/50 rounded-2xl flex items-center px-4 focus-within:border-black focus-within:ring-2 focus-within:ring-black/5 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or real name..."
                className="w-full bg-transparent px-3 py-4 outline-none text-slate-800 font-medium"
              />
            </div>
            <button 
              type="submit"
              disabled={!searchQuery.trim() || searching}
              className="px-8 bg-indigo-600 text-white shadow-lg shadow-indigo-200 rounded-2xl font-extrabold hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </form>

          <div className="space-y-4">
            {searchResults.length === 0 && searchQuery !== "" && !searching && (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-indigo-50/50">
                <p className="text-slate-500 font-medium">No users found matching "{searchQuery}"</p>
              </div>
            )}
            
            {searchResults.map(user => (
              <div key={user.id} className="bg-white border-2 border-indigo-50/50 p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <Link href={`/user/${user.id}`} className="font-extrabold text-slate-800 hover:text-blue-600 transition-colors">
                      {user.username}
                    </Link>
                    <p className="text-xs font-extrabold text-slate-500">{user.real_name || 'No Real Name'} • Trust Score: {user.trust_score}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleSendRequest(user.id)} 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-black font-extrabold text-sm rounded-2xl hover:bg-gray-200 active:scale-95 transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Add Friend
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FriendsPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-gray-300" /></div>}>
      <FriendsContent />
    </Suspense>
  );
}
