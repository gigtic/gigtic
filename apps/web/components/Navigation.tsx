"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { LayoutDashboard, PlusSquare, Home, Compass, MessageSquare, Briefcase, User, Users, Bell, Plus, MessageCircle } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isChatRoom = pathname === '/chat' && (searchParams.has('conv') || searchParams.has('dm'));

  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };

    fetchUnread();

    let currentUserId: string | null = null;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) currentUserId = data.user.id;
    });

    const channel = supabase.channel('nav_alerts')
      .on('postgres' as any, { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: any) => {
         fetchUnread();
         if (currentUserId && payload.new.user_id === currentUserId) {
            const urlPart = typeof payload.new.type === 'string' && payload.new.type.includes('|') ? payload.new.type.split('|')[1] : null;
            if (urlPart) {
              toast(
                (t) => (
                  <div 
                    onClick={() => {
                      toast.dismiss(t.id);
                      window.location.href = urlPart;
                    }}
                    className="flex items-center gap-2 cursor-pointer w-full h-full"
                  >
                    <span>🔔</span>
                    <span>{payload.new.message}</span>
                  </div>
                ),
                {
                  duration: 5000,
                  style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '12px 16px',
                  },
                }
              );
            } else {
              toast(payload.new.message, {
                icon: '🔔',
                duration: 5000,
                style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 'bold'
                },
              });
            }
         }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);


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
      <header className="hidden md:flex bg-white/60 backdrop-blur-xl border-b border-gray-200/50 h-16 items-center px-8 fixed top-0 left-0 right-0 z-50 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
        <Link href="/" className="flex items-center gap-2.5 mr-10 group">
          <Image 
            src="/logo.png" 
            alt="GigTic Logo" 
            width={36} 
            height={36} 
            className="rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300"
          />
          <span className="font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-gray-700 transition-colors">GigTic</span>
        </Link>
        
        <nav className="flex items-center space-x-2 flex-1">
          {navLinks.map(link => {
            const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
            return (
              <Link 
                key={link.path}
                href={link.path} 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/notifications" className="relative p-2.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </Link>
          
          <Link href="/create" className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-black/20 hover:scale-105 transition-all duration-300 active:scale-95">
            <PlusSquare className="w-4 h-4" />
            Post a Gig
          </Link>
        </div>
      </header>

      {/* Top Navbar for Mobile */}
      <header className="md:hidden bg-white/90 backdrop-blur-xl border-b border-gray-200/50 h-14 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="GigTic Logo" 
            width={28} 
            height={28} 
            className="rounded-lg shadow-sm"
          />
          <span className="font-extrabold text-lg tracking-tight text-gray-900">GigTic</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/friends" className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
            <Users className="w-5 h-5" />
          </Link>
          <Link href="/gigs" className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
            <Briefcase className="w-5 h-5" />
          </Link>
          <Link href="/notifications" className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </Link>
          
        </div>
      </header>

      {/* Anchored Bottom Tab Bar for Mobile */}
      {!isChatRoom && (
<nav 
        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 items-center h-[calc(60px+env(safe-area-inset-bottom))] z-[100] px-1 pb-[env(safe-area-inset-bottom)] shadow-sm"
      >
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors group ${pathname === '/' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
          <Home className={`w-5 h-5 group-active:scale-90 transition-transform ${pathname === '/' ? 'fill-indigo-600/20 stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link href="/explore" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors group ${pathname.startsWith('/explore') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
          <Compass className={`w-5 h-5 group-active:scale-90 transition-transform ${pathname.startsWith('/explore') ? 'fill-indigo-600/20 stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold">Explore</span>
        </Link>
        
        {/* Center Action Button */}
        <Link 
          href="/create" 
          className="relative -top-3 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-200 border-4 border-white active:scale-95 transition-transform mx-auto shrink-0"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </Link>
        
        <Link href="/chat" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors group relative ${pathname.startsWith('/chat') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
          <div className="relative">
            <MessageCircle className={`w-5 h-5 group-active:scale-90 transition-transform ${pathname.startsWith('/chat') ? 'fill-indigo-600/20 stroke-[2.5]' : 'stroke-2'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Inbox</span>
        </Link>
        
        <Link href="/profile" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors group ${pathname.startsWith('/profile') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
          <User className={`w-5 h-5 group-active:scale-90 transition-transform ${pathname.startsWith('/profile') ? 'fill-indigo-600/20 stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>
      </nav>
      )}
    </>
  );
}
