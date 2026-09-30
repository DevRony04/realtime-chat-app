'use client';

import { useEffect } from 'react';
import { subscribeToMessages } from '@/lib/appwrite/realtime';
import { Message } from '@/types/message';

interface RealtimeParams {
  currentUserId?: string;
  selectedUserId?: string;
  onNewMessage: (message: Message) => void;
  onUnreadMessage?: (senderId: string) => void;
}

export function useRealtimeMessages({
  currentUserId,
  selectedUserId,
  onNewMessage,
  onUnreadMessage,
}: RealtimeParams) {
  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = subscribeToMessages((incomingMessage: Message) => {
      const isForCurrentConversation =
        (incomingMessage.senderId === currentUserId && incomingMessage.recipientId === selectedUserId) ||
        (incomingMessage.senderId === selectedUserId && incomingMessage.recipientId === currentUserId);

      if (isForCurrentConversation) {
        onNewMessage(incomingMessage);
      } else if (incomingMessage.recipientId === currentUserId && incomingMessage.senderId !== selectedUserId) {
        // Message sent to current user from a user other than selected user
        if (onUnreadMessage) {
          onUnreadMessage(incomingMessage.senderId);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId, selectedUserId, onNewMessage, onUnreadMessage]);
}
