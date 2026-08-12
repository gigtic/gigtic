import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, Compass, PlusSquare, MessageSquare, User, LayoutDashboard } from "lucide-react";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "UniGig | Hyperlocal Student Network",
  description: "Connect, help, and earn on campus safely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.className} bg-[#FAFAFA] min-h-screen text-gray-900 pb-20 md:pb-0`}>
        {/* Top Navbar for Desktop */}
        <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 items-center px-8 sticky top-0 z-50 transition-all">
          <Link href="/" className="flex items-center gap-2 mr-10 group">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xs tracking-tighter">UG</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-black transition-colors">UniGig</span>
          </Link>
          
          <nav className="flex items-center space-x-1 flex-1">
            <Link href="/" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all">Home</Link>
            <Link href="/explore" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all">Explore</Link>
            <Link href="/chat" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all">Chats</Link>
            <Link href="/profile" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all">Profile</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <Link href="/create" className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-900 hover:shadow-lg hover:shadow-black/10 transition-all active:scale-95">
              <PlusSquare className="w-4 h-4" />
              Post a Gig
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-64px)] w-full">
          {children}
        </main>

        {/* Floating Bottom Tab Bar for Mobile */}
        <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl flex justify-around items-center h-16 z-50 px-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] pb-safe transition-transform">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-black transition-colors group">
            <Home className="w-[22px] h-[22px] group-active:scale-90 transition-transform" />
          </Link>
          <Link href="/explore" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-black transition-colors group">
            <Compass className="w-[22px] h-[22px] group-active:scale-90 transition-transform" />
          </Link>
          
          {/* Center Action Button */}
          <Link href="/create" className="flex flex-col items-center justify-center w-full h-full group relative -top-5">
            <div className="bg-black rounded-full p-3.5 shadow-xl shadow-black/20 text-white group-hover:bg-gray-900 group-active:scale-95 transition-all">
              <PlusSquare className="w-6 h-6" />
            </div>
          </Link>
          
          <Link href="/chat" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-black transition-colors group">
            <MessageSquare className="w-[22px] h-[22px] group-active:scale-90 transition-transform" />
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-black transition-colors group">
            <User className="w-[22px] h-[22px] group-active:scale-90 transition-transform" />
          </Link>
        </nav>
      </body>
    </html>
  );
}
