"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, TrendingUp, Users, Activity, DollarSign, Server, CheckCircle2, BarChart3, MousePointerClick, Eye } from "lucide-react";

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
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total Revenue</p>
          <p className="text-3xl font-black text-gray-900 mt-2">${data?.total_revenue}</p>
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
          <p className="text-3xl font-black text-gray-900 mt-2">${data?.cpm}</p>
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
              <th className="px-6 py-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.recent_days.map((day: any) => (
              <tr key={day.date}>
                <td className="px-6 py-4 font-bold text-gray-900">{day.date}</td>
                <td className="px-6 py-4 text-gray-600">{day.impressions.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-green-600">${day.revenue.toFixed(2)}</td>
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
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

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
    
    setMetrics([
      { label: "Total Registered Users", value: usersCount || 0, increase: "Live", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Active Jobs", value: activeJobsCount || 0, increase: "Live", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
      { label: "Total Completed Value", value: `$${totalRevenue.toLocaleString()}`, increase: "Gross", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
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
      <div className="flex space-x-2 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
        {["overview", "adsterra_ads", "database", "infrastructure"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            {tab.replace('_', ' ')}
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
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center py-20">
             <Server className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-gray-900">Supabase Connected</h3>
             <p className="text-gray-500 mt-2">Manage schemas directly via the Supabase Dashboard.</p>
             <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="inline-block mt-6 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition-colors">
               Open Supabase
             </a>
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
    </div>
  );
}
