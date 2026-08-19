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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="adsterra-verification" content="CXNE3410" />
        {/* CXNE3410 */}
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
               <AdsterraVertical adKey={"018c220ae6d7a03735b0d5d50f5b3684"} height={600} className="shadow-sm" />
            </aside>
          </AdWrapper>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-7xl min-h-[calc(100vh-64px)] relative z-10">
            {children}
          </main>

          {/* Right Ad Rail - Shows on screens > 1350px */}
          <AdWrapper>
            <aside className="hidden min-[1350px]:flex flex-col items-start w-[160px] shrink-0 pt-8 sticky top-16 h-[calc(100vh-64px)] z-0">
               <AdsterraVertical adKey={"018c220ae6d7a03735b0d5d50f5b3684"} className="shadow-sm" />
            </aside>
          </AdWrapper>

        </div>
        
        {/* Mobile Sticky Banner Ad */}
        <AdWrapper>
          <AdsterraMobileSticky adKey={"54114b0e7bc2595dc053f6499e762802"} />
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
