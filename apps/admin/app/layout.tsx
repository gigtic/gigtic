import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { LayoutDashboard, Users, BarChart3, Megaphone, ShieldAlert, Building2 } from 'lucide-react';

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "GigTic Admin Portal",
  description: "Internal portal for GigTic operations, marketing, and PR.",
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#111827", // Darker theme for admin
  width: "device-width",
  initialScale: 1,
};

function AdminSidebar() {
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
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-semibold text-sm">Dashboard</span>
        </Link>
      </nav>
      <div className="p-4 mt-auto border-t border-slate-100">
        <p className="text-xs text-slate-400 font-medium text-center">GigTic Admin v2.0</p>
      </div>
    </aside>
  );
}

function MobileHeader() {
  return (
    <div className="md:hidden bg-white border-b border-slate-200 text-slate-900 p-4 sticky top-0 z-40 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/20">
          <span className="text-white font-black text-[10px] tracking-tighter">GT</span>
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-900">Admin Portal</span>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.className} bg-slate-50 min-h-screen text-slate-900 flex flex-col md:flex-row selection:bg-indigo-600 selection:text-white`}>
        <Toaster position="top-right" />
        
        {/* Mobile Header */}
        <MobileHeader />

        {/* Persistent Admin Sidebar (Desktop only) */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}
