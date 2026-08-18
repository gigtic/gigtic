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
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-gray-900 font-black text-sm tracking-tighter">GT</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Admin</span>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium text-sm">Dashboard</span>
        </Link>
      </nav>
      <div className="p-4 mt-auto border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">GigTic Admin v2.0</p>
      </div>
    </aside>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.className} bg-gray-50 min-h-screen text-gray-900 flex`}>
        <Toaster position="top-right" />
        
        {/* Persistent Admin Sidebar */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}
