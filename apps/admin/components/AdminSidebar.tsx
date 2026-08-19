"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, Users, BarChart3, ShieldAlert, Database, KeyRound, Shield, DollarSign } from 'lucide-react';

const tabs = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "adsterra_ads", label: "Adsterra Ads", icon: DollarSign },
  { id: "user_management", label: "User Management", icon: Users },
  { id: "reports_&_issues", label: "Reports & Issues", icon: ShieldAlert },
  { id: "database", label: "Database", icon: Database },
  { id: "api_management", label: "API Management", icon: KeyRound },
  { id: "access_control", label: "Access Control", icon: Shield },
];

export default function AdminSidebar() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 text-slate-900 min-h-screen flex-col fixed left-0 top-0 bottom-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
            <span className="text-white font-black text-sm tracking-tighter">GT</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Admin</span>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto pb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link 
              key={tab.id}
              href={`/?tab=${tab.id}`} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? "bg-indigo-50 text-indigo-700 font-bold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto border-t border-slate-100">
        <p className="text-xs text-slate-400 font-medium text-center">GigTic Admin v2.0</p>
      </div>
    </aside>
  );
}
