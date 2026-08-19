"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldAlert, TrendingUp, Users, Activity, DollarSign, Server, CheckCircle2, BarChart3, MousePointerClick, Eye, IndianRupee, Search, KeyRound, Webhook, Link2, Shield, Trash2, Plus, Megaphone } from 'lucide-react';

function AdsterraDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/adsterra')
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4 mb-2">
        <h3 className="text-xl font-bold text-slate-900">Adsterra Publisher Analytics</h3>
        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">Live Data</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Total Revenue</p>
          <p className="text-3xl font-black text-slate-900 mt-2">₹{(data?.total_revenue * 83.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2"><Eye className="w-4 h-4" /> Impressions</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{data?.impressions.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2"><MousePointerClick className="w-4 h-4" /> Clicks</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{data?.clicks.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2"><Activity className="w-4 h-4" /> eCPM</p>
          <p className="text-3xl font-black text-slate-900 mt-2">₹{(data?.cpm * 83.5).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-bold text-slate-900">Last 7 Days Performance</h4>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Impressions</th>
              <th className="px-6 py-3 font-medium">Revenue (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.recent_days.map((day: any) => (
              <tr key={day.date}>
                <td className="px-6 py-4 font-bold text-slate-900">{day.date}</td>
                <td className="px-6 py-4 text-slate-600">{day.impressions.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-green-600">₹{(day.revenue * 83.5).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

function AdminDashboardContent() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [adminRole, setAdminRole] = useState("Admin");
  const [onlineCount, setOnlineCount] = useState(0);
  
  // Access Control State
  const [adminWhitelist, setAdminWhitelist] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const supabase = createClient();

  useEffect(() => {
    checkAuthAndLoadData();
    fetchUsers();

    // Subscribe to real-time presence
    const channel = supabase.channel('global_presence');
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        let count = 0;
        for (const id in state) {
          count += state[id].length > 0 ? 1 : 0;
        }
        setOnlineCount(count);
        setMetrics(prev => prev.map(m => m.label === "Currently Online" ? { ...m, value: count, increase: "Realtime" } : m));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async (query = "") => {
    let q = supabase.from("users").select("id, real_name, nickname, account_status, trust_score, created_at").order('created_at', { ascending: false }).limit(50);
    if (query) {
      q = q.ilike("nickname", `%${query}%`);
    }
    const { data } = await q;
    if (data) setUsers(data);
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const updateUserStatus = async (userId: string, status: string) => {
    if (!confirm(`Are you sure you want to change this user's status to ${status}?`)) return;
    const { error } = await supabase.rpc('admin_update_user_status', { target_user_id: userId, new_status: status });
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, account_status: status } : u));
    } else {
      alert("Failed to update status. Make sure the SQL RPC is deployed.");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to completely permanently delete this user profile? This cannot be undone.")) return;
    const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
    if (!error) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      alert("Failed to delete user. Make sure the SQL RPC is deployed.");
    }
  };

  const handleAddAdmin = async (e: any) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    setIsAddingAdmin(true);
    const { error } = await supabase.rpc('add_admin', { new_email: newAdminEmail });
    if (error) {
      alert("Failed to add admin. Please deploy the SQL script first.");
    } else {
      setNewAdminEmail("");
      checkAuthAndLoadData(); // refresh list
    }
    setIsAddingAdmin(false);
  };

  const handleRemoveAdmin = async (targetEmail: string) => {
    const { error } = await supabase.rpc('remove_admin', { target_email: targetEmail });
    if (error) {
      alert("Failed to remove admin.");
    } else {
      checkAuthAndLoadData(); // refresh list
    }
  };

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Security check using RPC (falls back to hardcoded if RPC fails)
    const email = user?.email?.toLowerCase() || '';
    setCurrentUserEmail(email);
    
    // Strict exact-match fallback for founders
    const masterAdmins = [
      "vineethbpawar@gmail.com",
      "gigtic.official@gmail.com",
      "keepsmilling64@gmail.com"
    ];
    let isAdmin = masterAdmins.includes(email);
    let roleName = isAdmin ? "Super Admin" : "Standard Admin";
    
    const { data: rpcIsAdmin, error: rpcError } = await supabase.rpc('check_admin_access');
    if (!rpcError && rpcIsAdmin) {
      isAdmin = true;
    }

    if (!user || !isAdmin) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    } 
    setIsAuthorized(true);
    setAdminRole(roleName);

    // Fetch core metrics
    const { count: usersCount } = await supabase.from("users").select("*", { count: 'exact', head: true });
    
    const { data: activeJobs } = await supabase.from("jobs").select("id").in("status", ["OPEN", "IN_PROGRESS"]);
    const activeJobsCount = activeJobs?.length || 0;

    const { data: completedJobs } = await supabase.from("jobs").select("budget_amount").eq("status", "COMPLETED");
    const totalRevenue = completedJobs?.reduce((sum, job) => sum + (Number(job.budget_amount) || 0), 0) || 0;
    
    // Fetch live DB stats
    const { data: stats, error: statsError } = await supabase.rpc('get_db_stats');
    if (stats && Array.isArray(stats) && stats.length > 0) {
      setDbStats(stats[0]);
    } else if (statsError) {
      setDbStats({ error: statsError.message });
    } else if (stats && typeof stats === 'object') {
      setDbStats(stats);
    }
    
    // Fetch reports
    const { data: adminReports } = await supabase.rpc('get_admin_reports');
    if (adminReports) {
      setReports(adminReports);
    }

    // Fetch admin whitelist
    const { data: whitelist } = await supabase.rpc('get_admin_whitelist');
    if (whitelist) {
      setAdminWhitelist(whitelist);
    }

    setMetrics(prev => [
      { label: "Total Registered Users", value: usersCount || 0, increase: "Live", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Currently Online", value: prev.find(m => m.label === "Currently Online")?.value || 0, increase: "Realtime", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
      { label: "Active Jobs", value: activeJobsCount || 0, increase: "Live", icon: CheckCircle2, color: "text-indigo-600", bg: "bg-indigo-50" },
      { label: "Total Completed Value", value: `₹${totalRevenue.toLocaleString('en-IN')}`, increase: "Gross", icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
    ]);
    
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-gray-300" /></div>;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 mb-2 text-center max-w-sm">
          Internal personnel only. You are currently signed in as:
        </p>
        <div className="bg-slate-100 text-slate-800 font-mono text-sm px-4 py-2 rounded-lg mb-8">
          {currentUserEmail || "Unknown user"}
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}`,
                  queryParams: { prompt: "select_account" } // Forces account selection
                },
              });
            }}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Switch Google Account
          </button>
          
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="w-full text-center py-3 text-sm text-slate-500 hover:text-slate-900 font-semibold transition-colors"
          >
            Log Out Completely
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans animate-in fade-in duration-500">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 pb-4 md:pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Headquarters Overview</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1 md:mt-2">Welcome to the GigTic internal control center.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="hidden md:flex items-center gap-3 pr-4 border-r border-slate-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200 shadow-sm">
              <span className="text-indigo-700 font-bold text-sm">
                {currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-slate-900 leading-none">{adminRole}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 leading-tight truncate max-w-[140px]">
                {currentUserEmail}
              </span>
            </div>
          </div>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 w-full md:w-auto shadow-sm"
          >
            Log Out
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 w-full md:w-auto shadow-sm">
            <TrendingUp className="w-4 h-4" /> Export DB
          </button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="flex md:hidden space-x-2 mb-6 bg-slate-100 p-1 rounded-xl w-full overflow-x-auto no-scrollbar">
        {["overview", "adsterra_ads", "user_management", "push_notifications", "reports_&_issues", "database", "api_management", "access_control"].map(tab => (
          <button 
            key={tab}
            onClick={() => router.push(`/?tab=${tab}`)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-all ${
              activeTab === tab 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Overview Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${m.bg}`}>
                    <m.icon className={`w-6 h-6 ${m.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                    {m.increase}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900">{m.value}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">{m.label}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col justify-center items-center">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Live Data Feed</h3>
              <p className="text-sm text-slate-500">Real-time charts require external BI tool connection.</p>
              <button className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">Configure BI Connection</button>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Trust & Safety</h3>
              <div className="flex-1 space-y-4">
                <div className="flex gap-3 items-start p-3 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-900">No Active Flags</p>
                    <p className="text-xs text-green-700 mt-1">Platform moderation queue is clear.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adsterra Analytics Content */}
      {activeTab === "adsterra_ads" && (
        <AdsterraDashboard />
      )}

      {/* Database Content */}
      {activeTab === "database" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-xl font-bold text-slate-900">PostgreSQL Infrastructure</h3>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h4 className="font-bold text-slate-900">Active Tables</h4>
                <span className="text-xs font-bold text-slate-500">public schema</span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Table Name</th>
                    <th className="px-6 py-3 font-medium">RLS Enabled</th>
                    <th className="px-6 py-3 font-medium">Est. Rows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-900">users</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Yes</span></td>
                    <td className="px-6 py-4 text-slate-600">{metrics.find(m => m.label === 'Total Registered Users')?.value || 0}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-900">jobs</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Yes</span></td>
                    <td className="px-6 py-4 text-slate-600">{metrics.find(m => m.label === 'Active Jobs')?.value || 0} (Open)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-900">messages</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Yes</span></td>
                    <td className="px-6 py-4 text-slate-600">Restricted</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-900">reviews</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Yes</span></td>
                    <td className="px-6 py-4 text-slate-600">Restricted</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4">Live Storage Usage</h4>
                {dbStats && !dbStats.error ? (
                  <div className="relative pt-1 space-y-4">
                    <div>
                      <div className="flex mb-2 items-center justify-between">
                        <div><span className="text-xs font-semibold inline-block text-blue-600">PostgreSQL Database Size</span></div>
                        <div className="text-right"><span className="text-xs font-semibold inline-block text-blue-600">{dbStats.db_size_pretty || '0 MB'}</span></div>
                      </div>
                      <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-blue-100">
                        <div style={{ width: `${Math.min(((dbStats.db_size_bytes || 0) / (500 * 1024 * 1024)) * 100, 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                      </div>
                      <p className="text-xs text-slate-400 text-right">Max 500 MB</p>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex mb-2 items-center justify-between">
                        <div><span className="text-xs font-semibold inline-block text-purple-600">File Storage ({dbStats.total_files || 0} files)</span></div>
                        <div className="text-right"><span className="text-xs font-semibold inline-block text-purple-600">{((dbStats.storage_bytes || 0) / (1024 * 1024)).toFixed(2)} MB</span></div>
                      </div>
                      <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-purple-100">
                        <div style={{ width: `${Math.min(((dbStats.storage_bytes || 0) / (1024 * 1024 * 1024)) * 100, 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
                      </div>
                      <p className="text-xs text-slate-400 text-right">Max 1 GB</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-orange-50 rounded-lg border border-orange-100">
                    <ShieldAlert className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-xs text-orange-800 font-bold px-4">
                      {dbStats?.error ? `RPC Error: ${dbStats.error}` : "RPC `get_db_stats` not deployed."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Infrastructure Content */}
      {activeTab === "infrastructure" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Vercel & Next.js Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">PostGIS Extension</p>
                <p className="text-xl font-black text-green-600">Enabled</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Cron Jobs</p>
                <p className="text-xl font-black text-green-600">Active</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Storage Mode</p>
                <p className="text-xl font-black text-slate-900">S3 / Supabase</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Production Build</p>
                <p className="text-xl font-black text-slate-900">Optimized</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Reports & Issues Content */}
      {activeTab === "reports_&_issues" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900">User Reports & Moderation</h4>
                <p className="text-xs text-slate-500 mt-1">Review flagged users and jobs from the community.</p>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                {reports?.filter(r => r.status === 'PENDING').length || 0} Pending
              </span>
            </div>
            
            {reports && reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Reporter</th>
                      <th className="px-6 py-3 font-medium">Target</th>
                      <th className="px-6 py-3 font-medium">Reason</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-slate-600">{new Date(report.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">@{report.reporter_nickname}</td>
                        <td className="px-6 py-4">
                          {report.reported_user_nickname ? (
                            <span className="text-blue-600 font-medium">User: @{report.reported_user_nickname}</span>
                          ) : report.reported_job_title ? (
                            <span className="text-purple-600 font-medium">Job: {report.reported_job_title}</span>
                          ) : (
                            <span className="text-slate-400">Unknown</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{report.reason}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            report.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                            report.status === 'INVESTIGATING' ? 'bg-blue-100 text-blue-700' :
                            report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 items-center">
                            {report.status === 'PENDING' && (
                              <button className="text-xs font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded">
                                Dismiss
                              </button>
                            )}
                            
                            {report.reported_user_id && (
                              <>
                                <button onClick={() => updateUserStatus(report.reported_user_id, 'SUSPENDED')} className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded">
                                  Suspend User
                                </button>
                                <button onClick={() => updateUserStatus(report.reported_user_id, 'BANNED')} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded">
                                  Block User
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No flags reported!</h3>
                <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">Your community is behaving nicely. No pending reports or issues require admin intervention.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === "push_notifications" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2"><Megaphone className="w-5 h-5 text-indigo-600"/> Push Notifications</h4>
                <p className="text-xs text-slate-500 mt-1">Send universal notifications to all active users instantly.</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notification Message</label>
                <textarea 
                  id="broadcastMessage"
                  className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium resize-none" 
                  placeholder="Type the message you want to broadcast to everyone..."
                ></textarea>
              </div>
              <button 
                onClick={async () => {
                  const msg = (document.getElementById('broadcastMessage')).value;
                  if (!msg) return alert("Message cannot be empty!");
                  
                  const { data: allUsers } = await supabase.from('users').select('id');
                  if (!allUsers || allUsers.length === 0) return alert("No users found");
                  
                  const notifications = allUsers.map(u => ({
                    user_id: u.id,
                    type: 'system_broadcast',
                    message: msg
                  }));
                  
                  const { error } = await supabase.from('notifications').insert(notifications);
                  if (error) {
                    alert("Failed to broadcast: " + error.message);
                  } else {
                    alert(`Successfully sent to ${allUsers.length} users!`);
                    (document.getElementById('broadcastMessage')).value = '';
                  }
                }}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Megaphone className="w-5 h-5" /> Broadcast to All Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Management Content */}
      {activeTab === "user_management" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h4 className="font-bold text-slate-900">User Management</h4>
                <p className="text-xs text-slate-500 mt-1">Search and manage community members.</p>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search nickname..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Search
                </button>
              </form>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Joined</th>
                    <th className="px-6 py-3 font-medium">Nickname</th>
                    <th className="px-6 py-3 font-medium">Real Name</th>
                    <th className="px-6 py-3 font-medium">Trust Score</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length > 0 ? users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">@{u.nickname}</td>
                      <td className="px-6 py-4 text-slate-600">{u.real_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.trust_score < 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {u.trust_score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          u.account_status === 'SUSPENDED' ? 'bg-orange-100 text-orange-700' : 
                          u.account_status === 'BANNED' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {u.account_status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {u.account_status !== 'BANNED' && (
                          <button onClick={() => updateUserStatus(u.id, 'BANNED')} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-bold transition-colors">
                            Block
                          </button>
                        )}
                        {u.account_status !== 'SUSPENDED' && (
                          <button onClick={() => updateUserStatus(u.id, 'SUSPENDED')} className="px-3 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded text-xs font-bold transition-colors">
                            Suspend
                          </button>
                        )}
                        {(u.account_status === 'SUSPENDED' || u.account_status === 'BANNED') && (
                          <button onClick={() => updateUserStatus(u.id, 'ACTIVE')} className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-bold transition-colors">
                            Unblock
                          </button>
                        )}
                        <button onClick={() => deleteUser(u.id)} className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-xs font-bold transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* API Management Content */}
      {activeTab === "api_management" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2"><KeyRound className="w-5 h-5 text-indigo-600"/> API & Integrations</h4>
                <p className="text-xs text-slate-500 mt-1">Manage external service connections and environment secrets.</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Supabase Connection */}
                <div className="border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-300 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <Server className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900">Supabase DB & Auth</h5>
                        <p className="text-xs text-slate-500">Core database, authentication, and storage.</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black tracking-wider rounded">Connected</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Project URL</label>
                      <div className="font-mono text-xs text-slate-800 bg-slate-50 px-3 py-2 rounded border border-slate-100 truncate mt-1">
                        {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Anon Key</label>
                      <div className="font-mono text-xs text-slate-800 bg-slate-50 px-3 py-2 rounded border border-slate-100 truncate mt-1">
                        {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '••••••••••••••••••••••••••••••••' : 'Not configured'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adsterra Connection */}
                <div className="border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:border-red-300 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900">Adsterra Publisher API</h5>
                        <p className="text-xs text-slate-500">Real-time revenue & ad analytics.</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black tracking-wider rounded">Connected</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">API Key</label>
                      <div className="font-mono text-xs text-slate-800 bg-slate-50 px-3 py-2 rounded border border-slate-100 truncate mt-1">
                        ••••••••••••••••••••••••••••••••
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Base URL</label>
                      <div className="font-mono text-xs text-slate-800 bg-slate-50 px-3 py-2 rounded border border-slate-100 truncate mt-1">
                        https://api3.adsterratools.com/publisher/stats.json
                      </div>
                    </div>
                  </div>
                </div>

                {/* Placeholder Webhooks */}
                <div className="border border-slate-200 rounded-xl p-5 border-dashed bg-slate-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Webhook className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-700">Custom Webhooks</h5>
                        <p className="text-xs text-slate-500">Trigger external services on GigTic events.</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] uppercase font-black tracking-wider rounded">Inactive</span>
                  </div>
                  <button className="w-full py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <Link2 className="w-3 h-3" /> Add Webhook Destination
                  </button>
                </div>

              </div>
              
              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4">
                <div className="mt-1"><ShieldAlert className="w-5 h-5 text-blue-600"/></div>
                <div>
                  <h6 className="font-bold text-blue-900 text-sm">Security Notice</h6>
                  <p className="text-xs text-blue-800 mt-1">
                    Environment variables and API keys cannot be modified directly from this dashboard for security reasons. 
                    To rotate keys or add new secrets, please update your <strong>Cloudflare Pages Environment Variables</strong> via the Cloudflare dashboard and trigger a new deployment.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Access Control Content */}
      {activeTab === "access_control" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-600"/> Portal Access Control</h4>
                <p className="text-xs text-slate-500 mt-1">Manage which email addresses can log into this admin dashboard.</p>
              </div>
            </div>
            
            <div className="p-6">
              {adminRole === "Super Admin" ? (
                <form onSubmit={handleAddAdmin} className="flex gap-3 mb-8 max-w-xl">
                  <input 
                    type="email" 
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Enter colleague's email address..." 
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-indigo-600 focus:border-indigo-600 block p-2.5"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isAddingAdmin}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAddingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Admin
                  </button>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 max-w-2xl">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">Permission Denied</p>
                    <p className="text-xs text-amber-700 mt-1">Only Super Admins can grant or revoke admin portal access. Please contact a founder to add new team members.</p>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-4 font-bold">Authorized Email</th>
                      <th scope="col" className="px-6 py-4 font-bold">Added On</th>
                      <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminWhitelist.map((admin, idx) => (
                      <tr key={idx} className="bg-white border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-0">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {admin.email}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {adminRole === "Super Admin" && (
                            <button 
                              onClick={() => handleRemoveAdmin(admin.email)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Revoke Access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {adminWhitelist.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                          No external admins added yet. (Master fallback accounts still have access).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
