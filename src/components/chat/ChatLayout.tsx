'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '@/types/auth';
import { UserProfile } from '@/types/user';
import { getUsers, createUserProfile } from '@/lib/appwrite/users';
import { useMessages } from '@/hooks/useMessages';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { UserList } from './UserList';
import { ConversationHeader } from './ConversationHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatLayoutProps {
  currentUser: AuthUser;
  onLogout: () => void;
}

export function ChatLayout({ currentUser, onLogout }: ChatLayoutProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Message hook for current conversation
  const {
    messages,
    loading: loadingMessages,
    error: messagesError,
    sending,
    sendMessage,
    addMessageIfNew,
  } = useMessages(currentUser.$id, selectedUser?.userId || selectedUser?.$id);

  // Fetch all registered user profiles with stable dependency array and internal guard
  useEffect(() => {
    if (!currentUser || !currentUser.$id) return;

    let isMounted = true;
    async function loadUsers() {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        // Self-healing check: ensure currently authenticated user has a profile document in the Users collection
        await createUserProfile({
          userId: currentUser.$id,
          name: currentUser.name || 'User',
          email: currentUser.email || '',
        }).catch((err) => console.warn('Self-healing profile check:', err));

        const list = await getUsers();
        if (isMounted) {
          setUsers(list);
        }
      } catch (err: unknown) {
        console.error('Failed to load user profiles:', err);
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Unable to load users';
          setUsersError(msg);
        }
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    }
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [currentUser.$id]);

  // Realtime subscription callback for new messages
  const handleRealtimeNewMessage = useCallback(
    (message: typeof messages[0]) => {
      addMessageIfNew(message);
    },
    [addMessageIfNew]
  );

  const handleUnreadMessage = useCallback((senderId: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [senderId]: (prev[senderId] || 0) + 1,
    }));
  }, []);

  // Hook into Appwrite Realtime
  useRealtimeMessages({
    currentUserId: currentUser.$id,
    selectedUserId: selectedUser?.userId || selectedUser?.$id,
    onNewMessage: handleRealtimeNewMessage,
    onUnreadMessage: handleUnreadMessage,
  });

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    // Clear unread count for selected user
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[user.userId];
      delete updated[user.$id];
      return updated;
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedUser) return;
    await sendMessage(content, currentUser.name);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar / User List */}
      <div
        className={`w-full md:w-80 lg:w-96 h-full shrink-0 ${
          selectedUser ? 'hidden md:block' : 'block'
        }`}
      >
        <UserList
          users={users}
          currentUser={currentUser}
          selectedUserId={selectedUser?.userId || selectedUser?.$id || null}
          unreadCounts={unreadCounts}
          loading={loadingUsers}
          error={usersError}
          onSelectUser={handleSelectUser}
          onLogout={onLogout}
        />
      </div>

      {/* Main Conversation Area */}
      <div
        className={`flex-1 h-full flex flex-col bg-white dark:bg-slate-900 ${
          !selectedUser ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedUser ? (
          <>
            <ConversationHeader
              selectedUser={selectedUser}
              onBackToUsers={() => setSelectedUser(null)}
            />
            <MessageList
              messages={messages}
              currentUserId={currentUser.$id}
              loading={loadingMessages}
              error={messagesError}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              sending={sending}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900/50">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-xs">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No conversation selected
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Choose a user from the sidebar to open an existing conversation or start a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
