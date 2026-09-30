'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/message';
import { getConversationMessages, sendMessage as apiSendMessage } from '@/lib/appwrite/messages';

export function useMessages(currentUserId?: string, selectedUserId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);

  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !selectedUserId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetched = await getConversationMessages(currentUserId, selectedUserId);
      setMessages((prev) => {
        // Merge fetched messages with any realtime messages received during initial fetch
        const map = new Map<string, Message>();
        fetched.forEach((m) => map.set(m.$id, m));
        prev.forEach((m) => {
          const belongs =
            (m.senderId === currentUserId && m.recipientId === selectedUserId) ||
            (m.senderId === selectedUserId && m.recipientId === currentUserId);
          if (belongs) map.set(m.$id, m);
        });
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return merged;
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load messages';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, selectedUserId]);

  useEffect(() => {
    setMessages([]);
    fetchMessages();
  }, [fetchMessages]);

  const addMessageIfNew = useCallback((incomingMessage: Message) => {
    setMessages((prevMessages) => {
      if (prevMessages.some((msg) => msg.$id === incomingMessage.$id)) {
        return prevMessages;
      }
      return [...prevMessages, incomingMessage];
    });
  }, []);

  const send = async (content: string, senderName: string) => {
    if (!currentUserId || !selectedUserId || !content.trim()) return;

    setSending(true);
    setError(null);

    try {
      const createdMessage = await apiSendMessage({
        senderId: currentUserId,
        recipientId: selectedUserId,
        senderName,
        content,
      });

      // Deduplicate with Realtime event
      addMessageIfNew(createdMessage);
      return createdMessage;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage: send,
    addMessageIfNew,
    refetchMessages: fetchMessages,
  };
}
