"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    let authError = null;

    if (isSignUp) {
      // Create new account
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      authError = error;
    } else {
      // Log into existing account
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authError = error;
    }

    if (authError) {
      setMessage(authError.message);
      setLoading(false);
    } else {
      // Success! Redirect to onboarding, which handles checking if profile exists
      router.push("/onboarding");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-md space-y-10 bg-white p-10 sm:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 mb-6">
            <span className="text-white font-black text-xl tracking-tighter">UG</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            {isSignUp 
              ? "Enter your university email and create a password to get started." 
              : "Enter your email and password to access your account."}
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all duration-200 sm:text-sm font-medium"
                placeholder="name@university.edu"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all duration-200 sm:text-sm font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-black hover:bg-gray-900 hover:shadow-xl hover:shadow-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  {isSignUp ? "Sign Up" : "Log In"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <button 
              type="button" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage("");
              }}
              className="text-sm text-gray-500 hover:text-black font-medium transition-colors"
            >
              {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
            </button>
          </div>

          {message && (
            <div className="text-center text-sm p-4 rounded-xl font-medium animate-in fade-in slide-in-from-bottom-2 bg-red-50 text-red-700 border border-red-100">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
