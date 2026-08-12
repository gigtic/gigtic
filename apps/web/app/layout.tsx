import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UniGig - Hyperlocal Student Gigs",
  description: "Connect, help, and earn on campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen pb-16`}>
        {/* Top Navbar for Desktop */}
        <header className="hidden md:flex bg-white border-b border-gray-200 h-16 items-center px-6 sticky top-0 z-50">
          <Link href="/" className="font-black text-2xl tracking-tighter text-blue-600 mr-8">UniGig.</Link>
          <nav className="flex space-x-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/explore" className="hover:text-blue-600 transition-colors">Explore</Link>
            <Link href="/create" className="hover:text-blue-600 transition-colors">Create Job</Link>
            <Link href="/chat" className="hover:text-blue-600 transition-colors">Chats</Link>
            <Link href="/profile" className="hover:text-blue-600 transition-colors">Profile</Link>
            <Link href="/admin" className="hover:text-blue-600 transition-colors">Admin</Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Bottom Tab Bar for Mobile */}
        <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 px-2 pb-safe">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="text-[10px] mt-1 font-medium">Explore</span>
          </Link>
          <Link href="/create" className="flex flex-col items-center justify-center w-full h-full text-blue-600 relative -top-3">
            <div className="bg-blue-600 rounded-full p-3 shadow-lg shadow-blue-200 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-[10px] mt-1 font-bold">Post</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span className="text-[10px] mt-1 font-medium">Chat</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px] mt-1 font-medium">Profile</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
