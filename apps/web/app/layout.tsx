import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Script from "next/script";
import AdsterraVertical from "@/components/AdsterraVertical";

import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "UniGig | Hyperlocal Student Network",
  description: "Connect, help, and earn on campus safely.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UniGig",
  },
  icons: {
    icon: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAFA",
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
      </head>
      <body className={`${inter.className} bg-[#FAFAFA] min-h-screen text-gray-900 pb-20 md:pb-0`}>
        <Toaster position="bottom-center" toastOptions={{ className: 'font-bold font-sans rounded-xl shadow-lg border border-gray-100' }} />
        <Navigation />
        {/* Main Layout Wrapper with Side Ads */}
        <div className="flex w-full max-w-[1500px] mx-auto justify-center gap-6">
          
          {/* Left Ad Rail - Shows on screens > 1150px */}
          <aside className="hidden min-[1150px]:flex flex-col items-end w-[160px] shrink-0 pt-8 sticky top-16 h-[calc(100vh-64px)] z-0">
             <AdsterraVertical className="shadow-sm" />
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-7xl min-h-[calc(100vh-64px)] relative z-10">
            {children}
          </main>

          {/* Right Ad Rail - Shows on screens > 1350px */}
          <aside className="hidden min-[1350px]:flex flex-col items-start w-[160px] shrink-0 pt-8 sticky top-16 h-[calc(100vh-64px)] z-0">
             <AdsterraVertical className="shadow-sm" />
          </aside>

        </div>
        
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
