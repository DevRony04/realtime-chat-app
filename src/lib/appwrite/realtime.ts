import { client } from './client';
import { appwriteConfig } from './config';
import { Message } from '@/types/message';

export function subscribeToMessages(
  onMessageReceived: (message: Message) => void
): () => void {
  const { databaseId, messagesCollectionId } = appwriteConfig;
  if (!databaseId || !messagesCollectionId) {
    return () => {};
  }

  const channel = `databases.${databaseId}.collections.${messagesCollectionId}.documents`;

  const unsubscribe = client.subscribe(channel, (response) => {
    // Verify event is document creation
    const isCreateEvent = response.events.some(
      (event) => event.endsWith('.create') || event.includes('.documents.') || event.includes('create')
    );

    if (isCreateEvent && response.payload) {
      const payload = response.payload as Record<string, unknown>;
      const senderId = (payload.senderId as string) || (payload.sender_id as string);
      const recipientId = (payload.recipientId as string) || (payload.recipient_id as string);
      const content = payload.content as string;
      const createdAt = (payload.$createdAt as string) || (payload.createdAt as string) || (payload.CreatedAt as string);

      if (payload.$id && senderId && recipientId && content) {
        onMessageReceived({
          $id: payload.$id as string,
          senderId,
          recipientId,
          senderName: (payload.senderName as string) || (payload.sender_name as string) || 'User',
          content,
          createdAt: createdAt || new Date().toISOString(),
        });
      }
    }
  });

  return unsubscribe;
}
