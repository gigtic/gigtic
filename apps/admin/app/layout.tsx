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
  themeColor: "#ffffff", 
  width: "device-width",
  initialScale: 1,
};

import AdminSidebar from '../components/AdminSidebar';

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
