"use client";

import { useState } from "react";

export default function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Computer Science major at XYZ University. I love building web apps and I can help you with your React/Node.js assignments.");
  const [trustScore] = useState(92);
  const [reviews] = useState([
    { id: 1, author: "Anonymous", rating: 5, tags: ["Fast Delivery", "Quality Work"], text: "Helped me debug my Next.js app right before the deadline. Lifesaver!", date: "2 days ago" },
    { id: 2, author: "@SarahT", rating: 4, tags: ["Friendly"], text: "Good tutor for Python.", date: "1 week ago" }
  ]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8 relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-6 pb-6 pt-0 relative -mt-16 sm:flex sm:items-end sm:justify-between">
          <div className="sm:flex sm:items-center">
            <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <span className="text-4xl font-bold text-gray-500">V</span>
            </div>
            <div className="mt-6 sm:mt-16 sm:ml-6">
              <h1 className="text-3xl font-bold text-gray-900 truncate">@Vini</h1>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                Real name hidden <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">Verified Student</span>
              </p>
            </div>
          </div>
          <div className="mt-6 sm:mt-0">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            >
              {isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Bio & Trust Score Grid */}
        <div className="px-6 py-6 border-t border-gray-100 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About Me</h3>
              {isEditing ? (
                <textarea 
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">{bio}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Skills / Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {["React.js", "Node.js", "Math Tutoring", "Campus Deliveries"].map(skill => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Trust Score</h3>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={251.2} 
                  strokeDashoffset={251.2 - (251.2 * trustScore) / 100}
                  className={`${trustScore >= 80 ? 'text-green-500' : trustScore >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                />
              </svg>
              <span className="absolute text-2xl font-black text-gray-800">{trustScore}</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">Based on 12 completed jobs</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="font-medium text-gray-900">{review.author}</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {review.tags.map(tag => (
                  <span key={tag} className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{tag}</span>
                ))}
              </div>
              <p className="text-gray-700 text-sm mb-2">"{review.text}"</p>
              <div className="text-xs text-gray-400">{review.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
