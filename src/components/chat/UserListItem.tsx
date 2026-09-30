'use client';

import { UserProfile } from '@/types/user';

interface UserListItemProps {
  user: UserProfile;
  isSelected: boolean;
  unreadCount?: number;
  onClick: () => void;
}

export function UserListItem({ user, isSelected, unreadCount = 0, onClick }: UserListItemProps) {
  // Generate initials for avatar
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <button
      onClick={onClick}
      className={`w-full p-3.5 rounded-xl flex items-center gap-3.5 transition-all text-left ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 shadow-xs'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 transition-colors ${
          isSelected
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
        }`}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3
            className={`text-sm font-semibold truncate ${
              isSelected
                ? 'text-blue-950 dark:text-blue-100'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {user.name}
          </h3>

          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-blue-600 rounded-full shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {user.email}
        </p>
      </div>
    </button>
  );
}
