'use client';

import { useEffect } from 'react';
import { subscribeToMessages } from '@/lib/appwrite/realtime';
import { Message } from '@/types/message';

interface RealtimeParams {
  currentUserId?: string;
  selectedUserId?: string;
  onNewMessage: (message: Message) => void;
  onUnreadMessage?: (senderId: string, messageId?: string) => void;
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
      // Ignore messages sent by the current user
      if (incomingMessage.senderId === currentUserId) {
        const isForCurrentConversation = selectedUserId && incomingMessage.recipientId === selectedUserId;
        if (isForCurrentConversation) {
          onNewMessage(incomingMessage);
        }
        return;
      }

      const isForCurrentConversation = selectedUserId &&
        ((incomingMessage.senderId === currentUserId && incomingMessage.recipientId === selectedUserId) ||
          (incomingMessage.senderId === selectedUserId && incomingMessage.recipientId === currentUserId));

      if (isForCurrentConversation) {
        onNewMessage(incomingMessage);
      } else if (incomingMessage.recipientId === currentUserId && incomingMessage.senderId !== selectedUserId) {
        // Message sent to current user from a user other than the currently selected user
        if (onUnreadMessage) {
          onUnreadMessage(incomingMessage.senderId, incomingMessage.$id);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId, selectedUserId, onNewMessage, onUnreadMessage]);
}
