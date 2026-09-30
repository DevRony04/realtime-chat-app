'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isAppwriteConfigured } from '@/lib/appwrite/config';
import { ChatLayout } from '@/components/chat/ChatLayout';

export default function ChatPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const configured = isAppwriteConfigured();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading chat application...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {!configured && (
        <div className="bg-amber-500 text-slate-950 text-xs px-4 py-2 font-medium text-center shrink-0">
          ⚠️ Appwrite environment variables are not fully configured. Please set up your <code className="bg-amber-600/30 px-1 py-0.5 rounded font-mono">.env.local</code> file.
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <ChatLayout currentUser={user} onLogout={logout} />
      </div>
    </div>
  );
}
