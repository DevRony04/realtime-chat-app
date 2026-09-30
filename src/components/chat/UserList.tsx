'use client';

import { useState } from 'react';
import { UserProfile } from '@/types/user';
import { AuthUser } from '@/types/auth';
import { UserListItem } from './UserListItem';

interface UserListProps {
  users: UserProfile[];
  currentUser: AuthUser;
  selectedUserId: string | null;
  unreadCounts: Record<string, number>;
  loading: boolean;
  error?: string | null;
  onSelectUser: (user: UserProfile) => void;
  onLogout: () => void;
}

export function UserList({
  users,
  currentUser,
  selectedUserId,
  unreadCounts,
  loading,
  error,
  onSelectUser,
  onLogout,
}: UserListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users
    .filter((u) => u.userId !== currentUser.$id && u.$id !== currentUser.$id)
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const currentUserInitials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ME';

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select a user to start chatting
        </p>

        {/* Search input */}
        <div className="mt-3 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {error ? (
          <div className="p-4 text-center text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-xl m-2 border border-red-200 dark:border-red-900">
            {error}
          </div>
        ) : loading ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            {searchQuery ? 'No matching users found.' : 'No other registered users available.'}
          </div>
        ) : (
          filteredUsers.map((user) => {
            // Deduplicate count lookup to avoid doubling when user.userId === user.$id
            const count =
              user.userId && user.userId !== user.$id
                ? (unreadCounts[user.userId] || 0) + (unreadCounts[user.$id] || 0)
                : unreadCounts[user.userId || user.$id] || 0;

            return (
              <UserListItem
                key={user.$id}
                user={user}
                isSelected={user.userId === selectedUserId || user.$id === selectedUserId}
                unreadCount={count}
                onClick={() => onSelectUser(user)}
              />
            );
          })
        )}
      </div>

      {/* Current user profile footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
            {currentUserInitials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {currentUser.email}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Logout"
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
