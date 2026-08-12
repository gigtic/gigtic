"use client";

import { useState } from "react";
import Link from "next/navigation";

// Mock data to simulate the RPC return type until Supabase is fully wired
const MOCK_JOBS = [
  {
    id: "1",
    requester_nickname: "Anonymous Student",
    requester_trust_score: 95,
    title: "Need help moving out of dorm",
    category: "Physical",
    description: "Looking for someone to help me carry 3 boxes down two flights of stairs.",
    service_mode: "Physical",
    budget_amount: 300,
    is_urgent: true,
    distance_km: 1.2
  },
  {
    id: "2",
    requester_nickname: "@Vini",
    requester_trust_score: 100,
    title: "React Native debugging",
    category: "Programming",
    description: "I have a weird issue with Expo Router, willing to pay for a 30 min pair programming session.",
    service_mode: "Digital",
    budget_amount: 500,
    is_urgent: false,
    distance_km: 0
  },
  {
    id: "3",
    requester_nickname: "@SarahT",
    requester_trust_score: 88,
    title: "Borrow Physics 101 Textbook",
    category: "Academic",
    description: "Need the textbook for the weekend. Will return by Monday.",
    service_mode: "Physical",
    budget_amount: 150,
    is_urgent: false,
    distance_km: 0.4
  }
];

export default function ExploreFeed() {
  const [filter, setFilter] = useState("All");

  const filteredJobs = MOCK_JOBS.filter(job => {
    if (filter === "Urgent") return job.is_urgent;
    if (filter === "Digital") return job.service_mode === "Digital";
    if (filter === "Nearby") return job.service_mode === "Physical" && job.distance_km < 3;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Explore Gigs</h1>
          <p className="text-gray-500 mt-1">Find students who need your help.</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {["All", "Nearby", "Digital", "Urgent"].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f === "Urgent" && "🚨 "}{f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
            {job.is_urgent && (
              <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                SOS / URGENT
              </div>
            )}
            
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
              <span className="text-lg font-semibold text-green-600">₹{job.budget_amount}</span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-medium">
                {job.requester_nickname}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                {job.requester_trust_score} Trust
              </span>
              <span className="flex items-center gap-1">
                📍 {job.service_mode === 'Physical' ? `${job.distance_km.toFixed(1)} km away` : 'Anywhere (Digital)'}
              </span>
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                {job.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
