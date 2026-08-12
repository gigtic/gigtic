"use client";

import { useState } from "react";

// Mock Data
const METRICS = [
  { label: "Total Users", value: "1,204", increase: "+12%" },
  { label: "Active Jobs", value: "342", increase: "+5%" },
  { label: "Jobs Completed (7d)", value: "89", increase: "+18%" },
  { label: "Flagged Content", value: "3", increase: "-2%" }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform metrics, user management, and moderation.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        {["overview", "users", "moderation", "categories"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((m, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">{m.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{m.value}</span>
                  <span className={`text-sm font-medium ${m.increase.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {m.increase}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64 flex items-center justify-center">
            <p className="text-gray-400 font-medium">Analytics Chart Placeholder</p>
          </div>
        </div>
      )}

      {/* Moderation Content */}
      {activeTab === "moderation" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Flagged Jobs</h2>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Job ID</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Reported By</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-6 py-4 font-mono text-gray-500">job_01H...</td>
                <td className="px-6 py-4 font-medium text-gray-900">Write my essay for me</td>
                <td className="px-6 py-4 text-gray-500">3 Users</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-600 hover:text-red-900 font-medium">1-Click Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
