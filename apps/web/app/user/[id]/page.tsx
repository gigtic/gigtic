"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User as UserIcon, Star, MapPin, Briefcase, Calendar, Shield, MessageSquare, UserPlus, Loader2, Clock, Flag, X } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);

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
      toast.success("Friend request sent!");
    }
  };

  const handleMessage = () => {
    router.push(`/chat?dm=${id}`);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !reportReason.trim()) return;
    setSubmittingReport(true);
    try {
      let screenshot_url = null;

      if (reportFile) {
        const fileExt = reportFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('reports')
          .upload(filePath, reportFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('reports')
          .getPublicUrl(filePath);
          
        screenshot_url = publicUrl;
      }

      const { error } = await supabase.from('user_reports').insert({
        reporter_id: currentUser.id,
        reported_id: id as string,
        reason: reportReason,
        screenshot_url
      });

      if (error) throw error;

      toast.success("Report submitted successfully.");
      setIsReportModalOpen(false);
      setReportReason("");
      setReportFile(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-black text-slate-800">User not found</h2>
      </div>
    );
  }

  const isMe = currentUser?.id === id;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 font-sans pb-16">
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
              <h1 className="text-3xl font-black text-slate-800">{profile.real_name || 'No Name Provided'}</h1>
              <p className="text-slate-500 font-medium">@{profile.username}</p>
            </div>
            
            {!isMe && (
              <div className="flex gap-3">
                {friendStatus === 'ACCEPTED' ? (
                  <button onClick={handleMessage} className="px-6 py-2.5 bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-extrabold rounded-2xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center gap-2 shadow-md">
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                ) : friendStatus === 'PENDING' ? (
                  <button disabled className="px-6 py-2.5 bg-gray-200 text-slate-500 font-extrabold rounded-2xl cursor-not-allowed flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Request Pending
                  </button>
                ) : (
                  <button onClick={handleAddFriend} className="px-6 py-2.5 bg-white border border-indigo-100/50 text-black font-extrabold rounded-2xl hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <UserPlus className="w-4 h-4" /> Add Friend
                  </button>
                )}
              </div>
            )}
            {!isMe && (
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="mt-4 md:mt-0 flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors font-semibold px-2 py-1"
              >
                <Flag className="w-4 h-4" /> Report User
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border-2 border-indigo-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
              <Star className="w-6 h-6 text-yellow-500 mb-2" />
              <span className="text-2xl font-black text-slate-800">{profile.trust_score || 0}</span>
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Trust Score</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border-2 border-indigo-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
              <Briefcase className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-2xl font-black text-slate-800">{profile.jobs_completed || 0}</span>
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Gigs Done</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border-2 border-indigo-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
              <Shield className="w-6 h-6 text-green-500 mb-2" />
              <span className="text-xl font-black text-slate-800">Verified</span>
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Status</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border-2 border-indigo-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
              <Calendar className="w-6 h-6 text-purple-500 mb-2" />
              <span className="text-lg font-black text-slate-800">
                {new Date(profile.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </span>
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Joined</span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white border-2 border-indigo-50/50 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-lg font-black text-slate-800 mb-4">About Me</h3>
            {profile.bio ? (
              <p className="text-gray-600 leading-relaxed font-medium">{profile.bio}</p>
            ) : (
              <p className="text-gray-400 italic">This user hasn't added a bio yet.</p>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              {profile.skills && profile.skills.map((skill: string, idx: number) => (
                <span key={idx} className="px-4 py-2 bg-gray-50 border border-indigo-100/50 rounded-full text-sm font-extrabold text-gray-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-800">Report User</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-1">Reason for reporting</label>
                <textarea 
                  required
                  rows={4}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-indigo-50 focus:border-indigo-500 focus:ring-0 transition-colors text-slate-800 font-medium resize-none"
                  placeholder="Please provide details..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-1">Screenshot (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl font-extrabold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submittingReport || !reportReason.trim()}
                  className="px-5 py-2.5 bg-red-500 text-white rounded-2xl font-extrabold hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingReport ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
