'use client';

import { UserProfile } from '@/types/user';

interface ConversationHeaderProps {
  selectedUser: UserProfile | null;
  onBackToUsers?: () => void;
}

export function ConversationHeader({ selectedUser, onBackToUsers }: ConversationHeaderProps) {
  if (!selectedUser) return null;

  const initials = selectedUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0 shadow-xs">
      <div className="flex items-center gap-3">
        {onBackToUsers && (
          <button
            onClick={onBackToUsers}
            className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to users list"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-semibold text-sm flex items-center justify-center shrink-0">
          {initials}
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {selectedUser.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {selectedUser.email}
          </p>
        </div>
      </div>
    </div>
  );
}
