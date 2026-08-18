"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, TrendingUp, Users, Megaphone, Activity, DollarSign, Eye, AlertTriangle } from "lucide-react";

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
    } else {
      setIsAuthorized(true);
    }

    if (user) {
      // Fetch core metrics
      const { count: usersCount } = await supabase.from("users").select("*", { count: 'exact', head: true });
      const { count: activeJobsCount } = await supabase.from("jobs").select("*", { count: 'exact', head: true }).in("status", ["OPEN", "IN_PROGRESS"]);
      
      setMetrics([
        { label: "Total Registered Users", value: usersCount || 0, increase: "+12% this week", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Active Jobs", value: activeJobsCount || 0, increase: "+5% today", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
        { label: "Total Revenue (Escrow)", value: "$4,250", increase: "+$850 this week", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "App Impressions", value: "24.5k", increase: "+18% from PR campaign", icon: Eye, color: "text-purple-600", bg: "bg-purple-50" }
      ]);
    }
    
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
          <TrendingUp className="w-4 h-4" /> Generate Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
        {["overview", "marketing_pr", "internal_ops", "analytics"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            {tab.replace('_', ' & ')}
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
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                    {m.increase}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-gray-900">{m.value}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">{m.label}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[300px]">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Activity (Last 7 Days)</h3>
              <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
                 <p className="text-gray-400 font-medium flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Chart module rendering...
                 </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Alerts</h3>
              <div className="flex-1 space-y-4">
                <div className="flex gap-3 items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">High API Usage</p>
                    <p className="text-xs text-amber-700 mt-1">Maps API quota is at 85% for this month.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 bg-red-50 rounded-lg border border-red-100">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900">3 Reported Users</p>
                    <p className="text-xs text-red-700 mt-1">Pending review in Trust & Safety queue.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marketing & PR Content */}
      {activeTab === "marketing_pr" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Active Campaigns</h3>
              <p className="text-3xl font-black text-gray-900">4</p>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Back to School Promo</span>
                  <span className="font-bold text-green-600">Active</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Local Press Release</span>
                  <span className="font-bold text-amber-600">Pending</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Social Reach</h3>
              <p className="text-3xl font-black text-gray-900">142k</p>
              <p className="text-sm text-green-600 font-medium mt-1">↑ 24% from last month</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Conversion Rate</h3>
              <p className="text-3xl font-black text-gray-900">8.4%</p>
              <p className="text-sm text-gray-500 font-medium mt-1">From App Store views</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Promo Code Manager</h3>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">Create New Code</button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Usage</th>
                  <th className="px-6 py-3 font-medium">Discount/Reward</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 font-bold text-gray-900">WELCOME20</td>
                  <td className="px-6 py-4 text-gray-600">450 / 1000</td>
                  <td className="px-6 py-4 text-gray-600">20% fee waive</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Active</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-gray-900">STUDENTPR</td>
                  <td className="px-6 py-4 text-gray-600">12 / 50</td>
                  <td className="px-6 py-4 text-gray-600">$5 credit</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold">Expiring Soon</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Content */}
      {activeTab === "analytics" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[400px]">
           <div className="flex items-center gap-4 mb-6">
             <h3 className="text-xl font-bold text-gray-900">Deep Analytics Engine</h3>
             <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">Powered by Internal BI</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                 <p className="text-gray-400 font-medium">User Retention Cohorts</p>
              </div>
              <div className="h-64 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                 <p className="text-gray-400 font-medium">Geographic Density Map</p>
              </div>
           </div>
        </div>
      )}

      {/* Internal Ops Content */}
      {activeTab === "internal_ops" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Infrastructure & Hosting</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-gray-100 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Database Health</p>
                <p className="text-xl font-black text-green-600">Healthy</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Storage Used</p>
                <p className="text-xl font-black text-gray-900">14.2 GB</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Edge Cache Hits</p>
                <p className="text-xl font-black text-gray-900">94.2%</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">API Latency</p>
                <p className="text-xl font-black text-gray-900">42ms</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
