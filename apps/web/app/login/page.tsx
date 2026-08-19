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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Left Side - Visual (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white blur-[100px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-300 blur-[120px]"></div>
        </div>
        
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8">
            <span className="text-indigo-600 font-black text-xl tracking-tighter">GT</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white leading-tight mt-12">
            Your Campus.<br />Your Skills.<br /><span className="text-indigo-200">Zero Fees.</span>
          </h1>
          <p className="text-indigo-100 text-lg mt-6 max-w-md font-medium leading-relaxed">
            The ultimate hyperlocal gig platform. Connect with students, find micro-jobs, and earn money safely on campus.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 text-indigo-100/80 text-sm font-medium">
          <div className="flex -space-x-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-indigo-400"></div>
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-purple-400"></div>
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-pink-400"></div>
          </div>
          <p>Join 10,000+ students earning today</p>
        </div>
      </div>

      {/* Right Side - Action */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-3 text-center lg:text-left">
            <div className="lg:hidden w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
              <span className="text-white font-black text-xl tracking-tighter">GT</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {isSignUp 
                ? "Enter your email and create a password to get started." 
                : "Enter your email and password to access your account."}
            </p>
          </div>
          
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 lg:bg-white text-slate-500 font-medium">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleAuth}>
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
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
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
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
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
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
                  className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
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
      </div>
    </div>
  );
}
