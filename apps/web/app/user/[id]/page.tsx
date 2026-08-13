"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User as UserIcon, Star, MapPin, Briefcase, Calendar, Shield, MessageSquare, UserPlus, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (id) loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    // Fetch user details
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userData) {
      setProfile(userData);

      // Check friendship status
      if (user && user.id !== id) {
        const { data: friendData } = await supabase
          .from('friendships')
          .select('status')
          .or(`and(requester_id.eq.${user.id},addressee_id.eq.${id}),and(requester_id.eq.${id},addressee_id.eq.${user.id})`)
          .single();
        
        if (friendData) {
          setFriendStatus(friendData.status);
        }
      }
    }
    setLoading(false);
  };

  const handleAddFriend = async () => {
    if (!currentUser) return;
    const { error } = await supabase.from('friendships').insert({
      requester_id: currentUser.id,
      addressee_id: id as string,
      status: 'PENDING'
    });
    if (!error) {
      setFriendStatus('PENDING');
      alert("Friend request sent!");
    }
  };

  const handleMessage = () => {
    router.push(`/chat?dm=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]">
        <h2 className="text-2xl font-black text-gray-900">User not found</h2>
      </div>
    );
  }

  const isMe = currentUser?.id === id;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] font-sans pb-16">
      {/* Header Banner */}
      <div className="h-48 bg-gradient-to-r from-gray-900 to-black w-full relative">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 lg:left-32 lg:translate-x-0">
          <div className="w-32 h-32 rounded-full border-4 border-[#FAFAFA] bg-white flex items-center justify-center overflow-hidden shadow-lg">
            {profile.profile_image_url ? (
              <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-12 h-12 text-gray-300" />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-20 flex flex-col lg:flex-row gap-8">
        
        {/* Main Info Column */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">{profile.real_name || 'No Name Provided'}</h1>
              <p className="text-gray-500 font-medium">@{profile.nickname}</p>
            </div>
            
            {!isMe && (
              <div className="flex gap-3">
                {friendStatus === 'ACCEPTED' ? (
                  <button onClick={handleMessage} className="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-900 active:scale-95 transition-all flex items-center gap-2 shadow-md">
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                ) : friendStatus === 'PENDING' ? (
                  <button disabled className="px-6 py-2.5 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Request Pending
                  </button>
                ) : (
                  <button onClick={handleAddFriend} className="px-6 py-2.5 bg-white border border-gray-200 text-black font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm">
                    <UserPlus className="w-4 h-4" /> Add Friend
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <Star className="w-6 h-6 text-yellow-500 mb-2" />
              <span className="text-2xl font-black text-gray-900">{profile.trust_score || 0}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trust Score</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <Briefcase className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-2xl font-black text-gray-900">{profile.jobs_completed || 0}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gigs Done</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <Shield className="w-6 h-6 text-green-500 mb-2" />
              <span className="text-xl font-black text-gray-900">Verified</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <Calendar className="w-6 h-6 text-purple-500 mb-2" />
              <span className="text-lg font-black text-gray-900">
                {new Date(profile.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-4">About Me</h3>
            {profile.bio ? (
              <p className="text-gray-600 leading-relaxed font-medium">{profile.bio}</p>
            ) : (
              <p className="text-gray-400 italic">This user hasn't added a bio yet.</p>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              {profile.skills && profile.skills.map((skill: string, idx: number) => (
                <span key={idx} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-bold text-gray-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
