export const runtime = 'edge';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Script from "next/script";
import AdsterraVertical from "@/components/AdsterraVertical";
import AdsterraMobileSticky from "@/components/AdsterraMobileSticky";
import AdWrapper from "@/components/AdWrapper";
import AdBlockDetector from "@/components/AdBlockDetector";
import NetworkMonitor from "@/components/NetworkMonitor";
import PresenceTracker from "@/components/PresenceTracker";
import { Toaster } from 'react-hot-toast';
import { createClient } from '@/utils/supabase/server';
import { ShieldAlert } from 'lucide-react';

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "GigTic | Hyperlocal Student Freelance Network",
  description: "Connect, help, and earn on campus safely. GigTic is the ultimate hyperlocal gig platform for students to find micro-jobs, freelance work, and services nearby.",
  keywords: ["student freelance", "campus jobs", "hyperlocal gigs", "student marketplace", "college side hustle", "micro-jobs"],
  authors: [{ name: "GigTic Team" }],
  openGraph: {
    title: "GigTic | Hyperlocal Student Network",
    description: "Connect, help, and earn on campus safely. Find micro-jobs and services nearby.",
    url: "https://gigtic.in",
    siteName: "GigTic",
    images: [
      {
        url: "https://gigtic.in/logo.png",
        width: 800,
        height: 600,
        alt: "GigTic Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GigTic | Hyperlocal Student Network",
    description: "Connect, help, and earn on campus safely.",
    images: ["https://gigtic.in/logo.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GigTic",
  },
  icons: {
    icon: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAFA",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isBlocked = false;
  let statusStr = '';
  
  if (user) {
    const { data: userData } = await supabase.from('users').select('account_status').eq('id', user.id).single();
    if (userData && (userData.account_status === 'SUSPENDED' || userData.account_status === 'BANNED')) {
      isBlocked = true;
      statusStr = userData.account_status.toLowerCase();
    }
  }

  if (isBlocked) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-slate-100 flex items-center justify-center min-h-screen`}>
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full mx-4 text-center border border-red-100">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 mb-2">Account Disabled</h1>
            <p className="text-slate-600 mb-8 font-medium">Your account has been strictly {statusStr} by the GigTic Admin team for violating community guidelines.</p>
            <form action={async () => {
              "use server";
              const { createClient } = await import('@/utils/supabase/server');
              const supabase = await createClient();
              await supabase.auth.signOut();
            }}>
              <button type="submit" className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-xl font-bold">
                Sign Out
              </button>
            </form>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        
      </head>
      <body className={`${inter.className} bg-[#FAFAFA] min-h-[100dvh] text-gray-900 pb-[140px] md:pb-0`}>
        <Toaster position="bottom-center" toastOptions={{ className: 'font-bold font-sans rounded-xl shadow-lg border border-gray-100 mb-20 md:mb-0' }} />
        <NetworkMonitor />
        <AdBlockDetector />
        <PresenceTracker />
        <Navigation />
        {/* Main Layout Wrapper with Side Ads */}
        <div className="flex w-full max-w-[1500px] mx-auto justify-center gap-6">
          
          {/* Left Ad Rail - Shows on screens > 1150px */}
          <AdWrapper>
            <aside className="hidden min-[1150px]:flex flex-col items-end w-[160px] shrink-0 pt-8 sticky top-16 h-[calc(100vh-64px)] z-0">
               <AdsterraVertical adKey={"cf9bd791087660a2358c950080649eab"} height={600} className="shadow-sm" />
            </aside>
          </AdWrapper>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-7xl min-h-[calc(100vh-64px)] relative z-10">
            {children}
          </main>

          {/* Right Ad Rail - Shows on screens > 1350px */}
          <AdWrapper>
            <aside className="hidden min-[1350px]:flex flex-col items-start w-[160px] shrink-0 pt-8 sticky top-16 h-[calc(100vh-64px)] z-0">
               <AdsterraVertical adKey={"dacda670c436fab7ed7cd7db964ff312"} className="shadow-sm" />
            </aside>
          </AdWrapper>

        </div>
        
        {/* Mobile Sticky Banner Ad */}
        <AdWrapper>
          <AdsterraMobileSticky adKey={"7f3286128752fe83d078b48ca0c7face"} />
        </AdWrapper>
        
        {/* Service Worker Registration */}
        <Script id="sw-registration" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('Service Worker registration successful with scope: ', registration.scope);
                  },
                  function(err) {
                    console.log('Service Worker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
