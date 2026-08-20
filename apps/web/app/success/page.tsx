"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdsterraUnit from "@/components/AdsterraUnit";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      {/* Success Icon & Animation */}
      <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)] animate-in zoom-in duration-500">
        <CheckCircle2 className="w-14 h-14" />
      </div>

      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Awesome!</h1>
      <p className="text-gray-500 font-medium mb-8">
        Your gig is now live and visible to everyone.
      </p>

      {/* Prominent Native Ad Unit */}
      <div className="w-full mb-10">
        <AdsterraUnit />
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3">
        {id && (
          <Link 
            href={`/job/${id}`}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
          >
            View My New Gig <ArrowRight className="w-5 h-5" />
          </Link>
        )}
        <Link 
          href="/explore"
          className="w-full py-4 bg-white text-gray-900 border-2 border-gray-200 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
        >
          Back to Explore
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-[#FAFAFA]" />}>
      <SuccessContent />
    </Suspense>
  );
}
