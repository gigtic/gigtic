"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-6">
          <span>UniGig</span>
        </Link>
        <div className="flex flex-1 items-center space-x-4 text-sm font-medium">
          <Link 
            href="/gigs" 
            className={`transition-colors hover:text-black ${pathname === '/gigs' ? 'text-black font-bold' : 'text-gray-500'}`}
          >
            My Gigs
          </Link>
          <Link 
            href="/explore" 
            className={`transition-colors hover:text-black ${pathname === '/explore' ? 'text-black font-bold' : 'text-gray-500'}`}
          >
            Explore
          </Link>
          <Link 
            href="/create" 
            className={`transition-colors hover:text-black ${pathname === '/create' ? 'text-black font-bold' : 'text-gray-500'}`}
          >
            Create
          </Link>
          <Link 
            href="/chat" 
            className={`transition-colors hover:text-black ${pathname === '/chat' ? 'text-black font-bold' : 'text-gray-500'}`}
          >
            Chat
          </Link>
          <Link 
            href="/profile" 
            className={`transition-colors hover:text-black ${pathname === '/profile' ? 'text-black font-bold' : 'text-gray-500'}`}
          >
            Profile
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className={buttonVariants({ variant: "outline" })}>
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants()}>
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
