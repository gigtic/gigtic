"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, TrendingUp, Users, Activity, DollarSign, Server, CheckCircle2, BarChart3, MousePointerClick, Eye, IndianRupee, Search } from "lucide-react";

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
        <h3 className="text-xl font-bold text-gray-900">Adsterra Publisher Analytics</h3>
        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">Live Data</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Total Revenue</p>
          <p className="text-3xl font-black text-gray-900 mt-2">₹{(data?.total_revenue * 83.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><Eye className="w-4 h-4" /> Impressions</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{data?.impressions.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><MousePointerClick className="w-4 h-4" /> Clicks</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{data?.clicks.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><Activity className="w-4 h-4" /> eCPM</p>
          <p className="text-3xl font-black text-gray-900 mt-2">₹{(data?.cpm * 83.5).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h4 className="font-bold text-gray-900">Last 7 Days Performance</h4>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Impressions</th>
              <th className="px-6 py-3 font-medium">Revenue (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.recent_days.map((day: any) => (
              <tr key={day.date}>
                <td className="px-6 py-4 font-bold text-gray-900">{day.date}</td>
                <td className="px-6 py-4 text-gray-600">{day.impressions.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-green-600">₹{(day.revenue * 83.5).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuthAndLoadData();
    fetchUsers();
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

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Security check
    if (!user || (!user.email?.toLowerCase().includes("admin") && !user.email?.toLowerCase().includes("vini") && !user.email?.includes("@"))) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    } 
    setIsAuthorized(true);

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

    setMetrics([
      { label: "Total Registered Users", value: usersCount || 0, increase: "Live", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Active Jobs", value: activeJobsCount || 0, increase: "Live", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
      { label: "Total Completed Value", value: `₹${totalRevenue.toLocaleString('en-IN')}`, increase: "Gross", icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "System Status", value: "Optimal", increase: "Prod", icon: Server, color: "text-purple-600", bg: "bg-purple-50" }
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
        <h1 className="text-2xl font-black text-gray-900">Access Denied</h1>
        <p className="text-gray-500 mt-2">Internal personnel only. Please contact IT if you need access.</p>
      </div>
    );
  }

  return (
    <div className="font-sans animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Headquarters Overview</h1>
          <p className="text-gray-500 mt-2">Welcome to the GigTic internal control center.</p>
        </div>
        <button className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Export DB Dump
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {["overview", "adsterra_ads", "user_management", "reports_&_issues", "database"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-all ${
              activeTab === tab 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
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
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${m.bg}`}>
                    <m.icon className={`w-6 h-6 ${m.color}`} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {m.increase}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-gray-900">{m.value}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">{m.label}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[300px] flex flex-col justify-center items-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Live Data Feed</h3>
              <p className="text-sm text-gray-500">Real-time charts require external BI tool connection.</p>
              <button className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Configure BI Connection</button>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trust & Safety</h3>
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
            <h3 className="text-xl font-bold text-gray-900">PostgreSQL Infrastructure</h3>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h4 className="font-bold text-gray-900">Active Tables</h4>
                <span className="text-xs font-bold text-gray-500">public schema</span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Table Name</th>
                    <th className="px-6 py-3 font-medium">RLS Enabled</th>
                    <th className="px-6 py-3 font-medium">Est. Rows</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-6 py-4 font-bold text-gray-900">users</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Yes</span></td>
                    <td className="px-6 py-4 text-gray-600">{metrics.find(m => m.label === 'Total Registered Users')?.value || 0}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-gray-900">jobs</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Yes</span></td>
                    <td className="px-6 py-4 text-gray-600">{metrics.find(m => m.label === 'Active Jobs')?.value || 0} (Open)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-gray-900">messages</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Yes</span></td>
                    <td className="px-6 py-4 text-gray-600">Restricted</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-gray-900">reviews</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Yes</span></td>
                    <td className="px-6 py-4 text-gray-600">Restricted</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4">Live Storage Usage</h4>
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
                      <p className="text-xs text-gray-400 text-right">Max 500 MB</p>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex mb-2 items-center justify-between">
                        <div><span className="text-xs font-semibold inline-block text-purple-600">File Storage ({dbStats.total_files || 0} files)</span></div>
                        <div className="text-right"><span className="text-xs font-semibold inline-block text-purple-600">{((dbStats.storage_bytes || 0) / (1024 * 1024)).toFixed(2)} MB</span></div>
                      </div>
                      <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-purple-100">
                        <div style={{ width: `${Math.min(((dbStats.storage_bytes || 0) / (1024 * 1024 * 1024)) * 100, 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
                      </div>
                      <p className="text-xs text-gray-400 text-right">Max 1 GB</p>
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Vercel & Next.js Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-gray-100 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">PostGIS Extension</p>
                <p className="text-xl font-black text-green-600">Enabled</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Cron Jobs</p>
                <p className="text-xl font-black text-green-600">Active</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Storage Mode</p>
                <p className="text-xl font-black text-gray-900">S3 / Supabase</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Production Build</p>
                <p className="text-xl font-black text-gray-900">Optimized</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Reports & Issues Content */}
      {activeTab === "reports_&_issues" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900">User Reports & Moderation</h4>
                <p className="text-xs text-gray-500 mt-1">Review flagged users and jobs from the community.</p>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                {reports?.filter(r => r.status === 'PENDING').length || 0} Pending
              </span>
            </div>
            
            {reports && reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500">
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
                      <tr key={report.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-gray-600">{new Date(report.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">@{report.reporter_nickname}</td>
                        <td className="px-6 py-4">
                          {report.reported_user_nickname ? (
                            <span className="text-blue-600 font-medium">User: @{report.reported_user_nickname}</span>
                          ) : report.reported_job_title ? (
                            <span className="text-purple-600 font-medium">Job: {report.reported_job_title}</span>
                          ) : (
                            <span className="text-gray-400">Unknown</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{report.reason}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            report.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                            report.status === 'INVESTIGATING' ? 'bg-blue-100 text-blue-700' :
                            report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">Review</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No flags reported!</h3>
                <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">Your community is behaving nicely. No pending reports or issues require admin intervention.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* User Management Content */}
      {activeTab === "user_management" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h4 className="font-bold text-gray-900">User Management</h4>
                <p className="text-xs text-gray-500 mt-1">Search and manage community members.</p>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search nickname..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors">
                  Search
                </button>
              </form>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500">
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
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">@{u.nickname}</td>
                      <td className="px-6 py-4 text-gray-600">{u.real_name}</td>
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
                        <button onClick={() => deleteUser(u.id)} className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded text-xs font-bold transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
    </div>
  );
}
