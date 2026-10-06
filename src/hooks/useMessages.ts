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
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetched = await getConversationMessages(currentUserId, selectedUserId);
      const marked = fetched.map((m) => ({
        ...m,
        status: 'sent' as const,
      }));

      setMessages((prev) => {
        const pendingOptimistic = prev.filter(
          (m) =>
            m.senderId === currentUserId &&
            m.recipientId === selectedUserId &&
            (m.status === 'sending' || m.status === 'failed')
        );

        const map = new Map<string, Message>();
        marked.forEach((m) => map.set(m.$id, m));
        pendingOptimistic.forEach((m) => map.set(m.$id, m));

        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return merged;
      });
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load messages';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, selectedUserId]);

  useEffect(() => {
    if (!currentUserId || !selectedUserId) {
      return;
    }

    let ignore = false;
    getConversationMessages(currentUserId, selectedUserId)
      .then((fetched) => {
        if (ignore) return;
        const marked = fetched.map((m) => ({
          ...m,
          status: 'sent' as const,
        }));

        setMessages((prev) => {
          const pendingOptimistic = prev.filter(
            (m) =>
              m.senderId === currentUserId &&
              m.recipientId === selectedUserId &&
              (m.status === 'sending' || m.status === 'failed')
          );

          const map = new Map<string, Message>();
          marked.forEach((m) => map.set(m.$id, m));
          pendingOptimistic.forEach((m) => map.set(m.$id, m));

          const merged = Array.from(map.values());
          merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          return merged;
        });
        setError(null);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        const message = err instanceof Error ? err.message : 'Failed to load messages';
        setError(message);
      })
      .finally(() => {
        if (ignore) return;
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [currentUserId, selectedUserId]);

  // Add Realtime message with optimistic reconciliation and deduplication
  const addMessageIfNew = useCallback((incomingMessage: Message) => {
    setMessages((prevMessages) => {
      // 1. If exact document $id exists, update status to 'sent'
      const existingById = prevMessages.find((m) => m.$id === incomingMessage.$id);
      if (existingById) {
        return prevMessages.map((m) =>
          m.$id === incomingMessage.$id ? { ...m, ...incomingMessage, status: 'sent' } : m
        );
      }

      // 2. Reconcile matching optimistic sending message (same sender, recipient, and content)
      const matchingOptimisticIndex = prevMessages.findIndex(
        (m) =>
          m.senderId === incomingMessage.senderId &&
          m.recipientId === incomingMessage.recipientId &&
          m.content.trim() === incomingMessage.content.trim() &&
          (m.status === 'sending' || Boolean(m.tempId))
      );

      if (matchingOptimisticIndex !== -1) {
        const updated = [...prevMessages];
        updated[matchingOptimisticIndex] = {
          ...incomingMessage,
          status: 'sent',
        };
        return updated;
      }

      // 3. Otherwise append incoming message as 'sent'
      return [...prevMessages, { ...incomingMessage, status: 'sent' }];
    });
  }, []);

  // Send message function with optimistic insert and failure handling
  const send = async (content: string, senderName: string, messageToRetry?: Message) => {
    if (!currentUserId || !selectedUserId || !content.trim()) return;

    const trimmedContent = content.trim();
    const tempId =
      messageToRetry?.tempId ||
      messageToRetry?.$id ||
      `temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const optimisticMessage: Message = {
      $id: tempId,
      tempId,
      senderId: currentUserId,
      recipientId: selectedUserId,
      senderName,
      content: trimmedContent,
      createdAt: messageToRetry?.createdAt || new Date().toISOString(),
      status: 'sending',
    };

    // 1. Immediately insert/update optimistic message in conversation
    setMessages((prev) => {
      const exists = prev.some((m) => m.$id === tempId || m.tempId === tempId);
      if (exists) {
        return prev.map((m) => (m.$id === tempId || m.tempId === tempId ? optimisticMessage : m));
      }
      return [...prev, optimisticMessage];
    });

    setSending(true);
    setError(null);

    try {
      // 2. Call Appwrite API
      const createdMessage = await apiSendMessage({
        senderId: currentUserId,
        recipientId: selectedUserId,
        senderName,
        content: trimmedContent,
      });

      // 3. On success: Reconcile optimistic message with created Appwrite document
      setMessages((prev) => {
        const map = new Map<string, Message>();
        prev.forEach((m) => {
          if (m.$id === tempId || m.tempId === tempId || m.$id === createdMessage.$id) {
            map.set(createdMessage.$id, {
              ...createdMessage,
              status: 'sent',
            });
          } else {
            map.set(m.$id, m);
          }
        });
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return merged;
      });

      return createdMessage;
    } catch (err: unknown) {
      // 4. On failure: Update optimistic message status to 'failed' (keeping it visible with Retry button)
      setMessages((prev) =>
        prev.map((m) => {
          if (m.$id === tempId || m.tempId === tempId) {
            return {
              ...m,
              status: 'failed',
            };
          }
          return m;
        })
      );

      const msg = err instanceof Error ? err.message : 'Failed to send message';
      setError(msg);
      throw err;
    } finally {
      setSending(false);
    }
  };

  const retryMessage = (msgToRetry: Message) => {
    return send(msgToRetry.content, msgToRetry.senderName, msgToRetry);
  };

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage: send,
    retryMessage,
    addMessageIfNew,
    refetchMessages: fetchMessages,
  };
}
