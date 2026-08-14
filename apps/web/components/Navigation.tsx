"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusSquare, Home, Compass, MessageSquare, Briefcase, User } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  // Do not show the internal app navigation on public/auth pages
  if (pathname === '/about' || pathname === '/login' || pathname.startsWith('/auth')) {
    return null;
  }

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/explore", label: "Explore" },
    { path: "/gigs", label: "My Gigs" },
    { path: "/chat", label: "Inbox" },
    { path: "/friends", label: "Friends" },
    { path: "/profile", label: "Profile" }
  ];

  return (
    <>
      {/* Top Navbar for Desktop */}
      <header className="hidden md:flex bg-white/60 backdrop-blur-xl border-b border-gray-200/50 h-16 items-center px-8 sticky top-0 z-50 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
        <Link href="/" className="flex items-center gap-2.5 mr-10 group">
          <Image 
            src="/logo.jpg" 
            alt="UniGig Logo" 
            width={36} 
            height={36} 
            className="rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300"
          />
          <span className="font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-gray-700 transition-colors">UniGig</span>
        </Link>
        
        <nav className="flex items-center space-x-2 flex-1">
          {navLinks.map(link => {
            const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
            return (
              <Link 
                key={link.path}
                href={link.path} 
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? "bg-black text-white shadow-md" 
                    : "text-gray-500 hover:text-black hover:bg-gray-900/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          <Link href="/create" className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-black/20 hover:scale-105 transition-all duration-300 active:scale-95">
            <PlusSquare className="w-4 h-4" />
            Post a Gig
          </Link>
        </div>
      </header>

      {/* Top Navbar for Mobile */}
      <header className="md:hidden bg-white/90 backdrop-blur-xl border-b border-gray-200/50 h-14 flex items-center justify-between px-4 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.jpg" 
            alt="UniGig Logo" 
            width={28} 
            height={28} 
            className="rounded-lg shadow-sm"
          />
          <span className="font-extrabold text-lg tracking-tight text-gray-900">UniGig</span>
        </Link>
        <Link href="/admin" className="p-2 text-gray-400 hover:text-black">
          <LayoutDashboard className="w-5 h-5" />
        </Link>
      </header>

      {/* Anchored Bottom Tab Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-2xl border-t border-gray-200/50 flex justify-around items-center h-16 z-[100] px-1 pb-[env(safe-area-inset-bottom)]">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full transition-colors group ${pathname === '/' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
          <Home className={`w-[22px] h-[22px] group-active:scale-90 transition-transform ${pathname === '/' ? 'fill-black' : ''}`} />
        </Link>
        <Link href="/explore" className={`flex flex-col items-center justify-center w-full h-full transition-colors group ${pathname.startsWith('/explore') ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
          <Compass className={`w-[22px] h-[22px] group-active:scale-90 transition-transform ${pathname.startsWith('/explore') ? 'fill-black' : ''}`} />
        </Link>
        
        {/* Center Action Button */}
        <Link href="/create" className="flex flex-col items-center justify-center w-full h-full group relative -top-4">
          <div className="bg-black rounded-full p-3.5 shadow-lg shadow-black/20 text-white group-active:scale-95 transition-transform border-[4px] border-white/50 backdrop-blur-sm">
            <PlusSquare className="w-6 h-6" />
          </div>
        </Link>
        
        <Link href="/chat" className={`flex flex-col items-center justify-center w-full h-full transition-colors group ${pathname.startsWith('/chat') ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
          <MessageSquare className={`w-[22px] h-[22px] group-active:scale-90 transition-transform ${pathname.startsWith('/chat') ? 'fill-black' : ''}`} />
        </Link>
        <Link href="/gigs" className={`flex flex-col items-center justify-center w-full h-full transition-colors group ${pathname.startsWith('/gigs') ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
          <Briefcase className={`w-[22px] h-[22px] group-active:scale-90 transition-transform ${pathname.startsWith('/gigs') ? 'fill-black' : ''}`} />
        </Link>
        <Link href="/profile" className={`flex flex-col items-center justify-center w-full h-full transition-colors group ${pathname.startsWith('/profile') ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
          <User className={`w-[22px] h-[22px] group-active:scale-90 transition-transform ${pathname.startsWith('/profile') ? 'fill-black' : ''}`} />
        </Link>
      </nav>
    </>
  );
}
