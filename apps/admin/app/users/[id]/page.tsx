"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ShieldAlert, CheckCircle2, User, Briefcase, IndianRupee, Activity, Shield, Mail, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { use as useReact } from "react";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = useReact(params);
  const userId = resolvedParams.id;
  const [user, setUser] = useState<any>(null);
  const [actionModal, setActionModal] = useState<{isOpen: boolean, type: "status" | "delete", targetStatus?: string} | null>(null);
  const [reasonInput, setReasonInput] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [stats, setStats] = useState({
    posted: 0,
    accepted: 0,
    completed: 0,
    earned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    // Fetch User Profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error(userError);
      setErrorMsg(userError);
      setLoading(false);
      return;
    }
    setUser(userData);

    // Fetch Stats
    // Posted Gigs
    const { count: postedCount } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("requester_id", userId);

    // Accepted Gigs
    const { data: acceptedGigs } = await supabase
      .from("jobs")
      .select("id, status, budget_amount")
      .eq("provider_id", userId);

    let accepted = 0;
    let completed = 0;
    let earned = 0;

    if (acceptedGigs) {
      accepted = acceptedGigs.length;
      acceptedGigs.forEach((gig) => {
        if (gig.status === "COMPLETED") {
          completed += 1;
          earned += Number(gig.budget_amount || 0);
        }
      });
    }

    setStats({
      posted: postedCount || 0,
      accepted,
      completed,
      earned,
    });
    setLoading(false);
  };

  const executeAction = async () => {
    if (!reasonInput.trim()) return toast.error("Reason is required.");
    setIsActionLoading(true);

    if (actionModal?.type === 'status' && actionModal.targetStatus) {
      const { error } = await supabase.rpc("admin_update_user_status", {
        target_user_id: user.id,
        new_status: actionModal.targetStatus,
        reason: reasonInput,
      });
      if (!error) {
        setUser({ ...user, account_status: actionModal.targetStatus, status_reason: reasonInput });
        const actionText = actionModal.targetStatus === "SUSPENDED" ? "suspended" : actionModal.targetStatus === "BANNED" ? "blocked" : "reactivated";
        await supabase.from("notifications").insert([{ user_id: user.id, message: `⚠️ Security Alert: Your account has been ${actionText} by the GigTic Admin. Reason: ${reasonInput}` }]);
        toast.success("User status updated successfully.");
        setActionModal(null);
        setReasonInput("");
      } else {
        toast.error("Failed: " + error.message);
      }
    } else if (actionModal?.type === 'delete') {
      const { error } = await supabase.rpc("admin_delete_user", { target_user_id: user.id, reason: reasonInput });
      if (!error) {
        toast.success("User deleted successfully.");
        router.push("/?tab=user_management");
      } else {
        toast.error("Failed: " + error.message);
      }
    }
    setIsActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-900">User Not Found</h1>
        <button
          onClick={() => router.push("/?tab=user_management")}
          className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => router.push("/?tab=user_management")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to User Management
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                {user.profile_image_url ? (
                  <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-indigo-400" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900">
                  {user.real_name || "Unknown"}
                </h1>
                <p className="text-slate-500 font-medium">@{user.username || user.nickname}</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  <p className="text-sm font-mono">{user.email || "No email attached"}</p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      user.account_status === "SUSPENDED"
                        ? "bg-orange-100 text-orange-700"
                        : user.account_status === "BANNED"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    {user.account_status || "ACTIVE"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      user.trust_score < 50 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    Trust Score: {user.trust_score}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="flex flex-wrap gap-3">
              {user.account_status !== "BANNED" && (
                <button
                  onClick={() => setActionModal({ isOpen: true, type: "status", targetStatus: "BANNED" })}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors"
                >
                  Block
                </button>
              )}
              {user.account_status !== "SUSPENDED" && (
                <button
                  onClick={() => setActionModal({ isOpen: true, type: "status", targetStatus: "SUSPENDED" })}
                  className="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-sm font-bold transition-colors"
                >
                  Suspend
                </button>
              )}
              {(user.account_status === "SUSPENDED" || user.account_status === "BANNED") && (
                <button
                  onClick={() => setActionModal({ isOpen: true, type: "status", targetStatus: "ACTIVE" })}
                  className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-bold transition-colors"
                >
                  Set Active
                </button>
              )}
              <button
                onClick={() => setActionModal({ isOpen: true, type: "delete" })}
                className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-red-600 rounded-lg text-sm font-bold transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" /> Platform Activity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">Gigs Posted</p>
                <p className="text-3xl font-black text-slate-900">{stats.posted}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">Gigs Accepted</p>
                <p className="text-3xl font-black text-slate-900">{stats.accepted}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <p className="text-sm font-medium text-green-700 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Gigs Completed
                </p>
                <p className="text-3xl font-black text-green-900">{stats.completed}</p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <p className="text-sm font-medium text-indigo-700 mb-1 flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" /> Total Earned
                </p>
                <p className="text-3xl font-black text-indigo-900">
                  ₹{stats.earned.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                {actionModal.type === 'delete' ? 'Delete User' : `Change Status to ${actionModal.targetStatus}`}
              </h3>
              <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Please provide a clear reason for this administrative action. This will be visible to the user.
              </p>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g. Violating community guidelines..."
                className="w-full h-24 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 text-sm resize-none"
              ></textarea>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setActionModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                  Cancel
                </button>
                <button 
                  onClick={executeAction}
                  disabled={isActionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2"
                >
                  {isActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

