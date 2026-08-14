import Link from "next/link";
import { ArrowRight, ShieldCheck, FileText, Database, Lock, Info } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="font-sans bg-white selection:bg-black selection:text-white min-h-screen pb-20">
      
      {/* Professional Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-tighter">UG</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">UniGig</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Log In
            </Link>
            <Link href="/login" className="text-sm font-bold bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Transparency, Privacy, and Trust.
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Welcome to the UniGig platform. Before you join our secure, hyperlocal student network, please review our comprehensive terms of service, data collection practices, and privacy standards.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm">
              Create an Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content: Terms & Data Collection */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* About UniGig */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Info className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">About UniGig</h2>
          </div>
          <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
            <p>
              UniGig was built on a simple philosophy: Student-First, Privacy-First. We believe every student has something to offer and sometimes needs a hand. That’s why there are no separate &quot;buyer&quot; or &quot;seller&quot; accounts—just one unified profile.
            </p>
            <p>
              Whether you&apos;re posting a midnight SOS request for an assignment or earning cash by utilizing your design skills, UniGig provides the secure, zero-commission infrastructure to make it happen. You control your radius, you control your privacy, and you keep 100% of your earnings.
            </p>
          </div>
        </section>

        {/* Data We Collect */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Data We Collect</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
              <p className="text-sm leading-relaxed">
                When you register, we collect your email address to establish your account. We do not require or store your real name or personal phone number to maintain your privacy.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Location Data</h3>
              <p className="text-sm leading-relaxed">
                To enable our hyperlocal matching engine, we securely process your approximate location (campus radius). This data is never sold and is strictly used to show you relevant gigs nearby.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Transaction History</h3>
              <p className="text-sm leading-relaxed">
                We maintain a record of completed tasks to calculate your Trust Score. We do not mediate or process payments, so we never collect your banking or credit card information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Communication Logs</h3>
              <p className="text-sm leading-relaxed">
                In-app messages are temporarily stored to facilitate job negotiations. All chats and job details are permanently and irreversibly erased from our servers 7 days after a job is completed.
              </p>
            </div>
          </div>
        </section>

        {/* Terms and Conditions */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
          </div>
          <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
            <p>
              By accessing or using UniGig, you agree to be bound by these Terms of Service and all applicable university codes of conduct.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Eligibility:</strong> You must have a valid email address to create an account and participate in the network.</li>
              <li><strong>Zero Commission:</strong> UniGig operates as a decentralized matching platform. We charge zero commission. Payment arrangements (Cash/UPI) are strictly between the requester and the provider.</li>
              <li><strong>Code of Conduct:</strong> Users must treat each other with respect. Any form of harassment, fraud, or violation of university policies will result in an immediate and permanent ban.</li>
              <li><strong>Liability:</strong> UniGig is not liable for any disputes, damages, or losses arising from interactions or transactions made through the platform. You agree to use the service at your own risk.</li>
            </ul>
          </div>
        </section>

        {/* Security & Privacy Commitment */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Security Commitment</h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            We employ industry-standard security measures, including end-to-end encryption for authentication and secure Row Level Security (RLS) policies on our database, to protect your data against unauthorized access. Our infrastructure is continuously audited to ensure compliance with modern data protection regulations.
          </p>
        </section>

      </main>

      {/* Footer CTA */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to agree and join?</h2>
          <p className="text-sm text-gray-500 mb-6">By signing up, you acknowledge that you have read and agreed to the above terms.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Lock className="w-4 h-4" /> Secure Log In / Sign Up
          </Link>
        </div>
      </footer>

    </div>
  );
}
