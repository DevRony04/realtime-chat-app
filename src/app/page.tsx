'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between">
      {/* Navbar */}
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
            C
          </div>
          <span className="font-bold text-lg tracking-tight">RealTime Chat</span>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-24 bg-slate-800 rounded-lg animate-pulse" />
          ) : user ? (
            <Link
              href="/chat"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-medium text-sm rounded-lg transition-colors shadow-sm"
            >
              Open Chat
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-medium text-sm rounded-lg transition-colors shadow-sm"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Powered by Appwrite Realtime & Next.js App Router
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Instant One-to-One Realtime Messaging
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-2xl leading-relaxed">
          A sleek, responsive, and secure chat application built with Next.js 15, TypeScript, Tailwind CSS, and Appwrite Cloud databases & realtime subscriptions.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          {loading ? (
            <div className="h-12 w-40 bg-slate-800 rounded-xl animate-pulse" />
          ) : user ? (
            <Link
              href="/chat"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-600/30 text-base"
            >
              Open Chat Application →
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-600/30 text-base"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all border border-slate-700 text-base"
              >
                Sign In to Account
              </Link>
            </>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold mb-4">
              ⚡
            </div>
            <h3 className="text-base font-bold text-white mb-1">Appwrite Realtime</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant message delivery across active tabs and devices using WebSocket realtime subscriptions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold mb-4">
              🔒
            </div>
            <h3 className="text-base font-bold text-white mb-1">Appwrite Auth</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Secure email/password authentication, persistent session management, and profile protection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold mb-4">
              📱
            </div>
            <h3 className="text-base font-bold text-white mb-1">Responsive Design</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tailored desktop & mobile experience with seamless conversation switching and auto-scroll.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 Deepyaman Mondal. All rights reserved.
      </footer>
    </div>
  );
}
