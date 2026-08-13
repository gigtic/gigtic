"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, MapPin, Wallet } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="font-sans selection:bg-black selection:text-white">
      
      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8 overflow-hidden min-h-[calc(100vh-64px)] flex flex-col justify-center items-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-sm font-bold text-gray-900 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            UniGig 2.0 is Live on Campus
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-gray-900 mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-5">
            The Hyperlocal <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">Student Gig Network.</span>
          </h1>
          
          <p className="text-lg sm:text-xl leading-relaxed text-gray-500 font-medium mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6">
            Need help moving out? Stuck on a coding assignment? Or just want to earn extra cash? Connect with verified students within your exact radius. Zero commission.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8">
            <Link 
              href="/explore" 
              className="w-full sm:w-auto group relative flex justify-center items-center gap-2 py-4 px-8 rounded-full text-white bg-black hover:bg-gray-900 font-bold hover:shadow-2xl hover:shadow-black/20 focus:outline-none transition-all duration-300 active:scale-95 text-lg"
            >
              Start Earning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/create" 
              className="w-full sm:w-auto flex justify-center items-center gap-2 py-4 px-8 rounded-full text-gray-900 bg-white border-2 border-gray-200 hover:border-black font-bold focus:outline-none transition-all duration-300 active:scale-95 text-lg"
            >
              Post a Gig
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-[#FAFAFA] border border-gray-100 p-10 rounded-3xl cursor-default"
            >
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Hyperlocal Matching</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Our PostGIS matching engine ensures you only see physical gigs that are exactly within your preferred walking or driving radius.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-[#FAFAFA] border border-gray-100 p-10 rounded-3xl cursor-default"
            >
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Zero Commission</h3>
              <p className="text-gray-500 font-medium leading-relaxed">We don't mediate payments. Complete the job and get paid 100% of your earnings directly via Cash or UPI using our 2-step handshake.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-[#FAFAFA] border border-gray-100 p-10 rounded-3xl cursor-default"
            >
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Your real name and phone number are hidden. Plus, all chats and job details are permanently erased 7 days after completion.</p>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}
