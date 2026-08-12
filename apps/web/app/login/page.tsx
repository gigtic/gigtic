"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Mail, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(""); // Clear message
      setStep("code"); // Move to code entry step
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      router.push("/explore");
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
            {step === "email" ? "Welcome to UniGig" : "Enter Verification Code"}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            {step === "email" 
              ? "Enter your university email to receive a secure 6-digit login code. No passwords required." 
              : `We sent a 6-digit code to ${email}. Please enter it below.`}
          </p>
        </div>
        
        {step === "email" ? (
          <form className="space-y-6" onSubmit={handleSendCode}>
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
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-black hover:bg-gray-900 hover:shadow-xl hover:shadow-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
              >
                {loading ? "Sending Code..." : (
                  <>
                    Send Login Code
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleVerifyCode}>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all duration-200 text-center tracking-[0.5em] font-bold text-lg"
                  placeholder="123456"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-black hover:bg-gray-900 hover:shadow-xl hover:shadow-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
              >
                {loading ? "Verifying..." : "Verify Code & Login"}
              </button>
            </div>
            
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => setStep("email")}
                className="text-sm text-gray-500 hover:text-black font-medium transition-colors"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}

        {message && (
          <div className="text-center text-sm p-4 rounded-xl font-medium animate-in fade-in slide-in-from-bottom-2 bg-red-50 text-red-700 border border-red-100">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
