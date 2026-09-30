import { ID, Query } from 'appwrite';
import { databases } from './client';
import { appwriteConfig } from './config';
import { Message } from '@/types/message';

export async function sendMessage(params: {
  senderId: string;
  recipientId: string;
  senderName: string;
  content: string;
}): Promise<Message> {
  const { databaseId, messagesCollectionId } = appwriteConfig;
  if (!databaseId || !messagesCollectionId) {
    throw new Error('Appwrite database or messages collection ID is not configured.');
  }

  const trimmedContent = params.content.trim();
  if (!trimmedContent) {
    throw new Error('Message content cannot be empty.');
  }

  const documentData = {
    senderId: params.senderId,
    recipientId: params.recipientId,
    senderName: params.senderName,
    content: trimmedContent,
  };

  try {
    const doc = await databases.createDocument(
      databaseId,
      messagesCollectionId,
      ID.unique(),
      documentData
    );

    return {
      $id: doc.$id,
      senderId: (doc.senderId as string) || (doc.sender_id as string) || params.senderId,
      recipientId: (doc.recipientId as string) || (doc.recipient_id as string) || params.recipientId,
      senderName: (doc.senderName as string) || (doc.sender_name as string) || params.senderName,
      content: (doc.content as string) || trimmedContent,
      createdAt: doc.$createdAt || (doc.createdAt as string) || (doc.CreatedAt as string) || new Date().toISOString(),
    };
  } catch (error: unknown) {
    const appwriteErr = error as { code?: number; message?: string };
    if (appwriteErr?.code === 401) {
      throw new Error(
        'Messages collection permission error (401): Please grant Role "Users" Create permission in Appwrite Console -> Databases -> Messages -> Settings -> Permissions.'
      );
    }
    throw error;
  }
}

export async function getConversationMessages(
  userAId: string,
  userBId: string
): Promise<Message[]> {
  const { databaseId, messagesCollectionId } = appwriteConfig;
  if (!databaseId || !messagesCollectionId) {
    throw new Error('Appwrite database or messages collection ID is not configured.');
  }

  try {
    const [resAtoB, resBtoA] = await Promise.all([
      databases.listDocuments(databaseId, messagesCollectionId, [
        Query.equal('senderId', userAId),
        Query.equal('recipientId', userBId),
        Query.limit(100),
      ]),
      databases.listDocuments(databaseId, messagesCollectionId, [
        Query.equal('senderId', userBId),
        Query.equal('recipientId', userAId),
        Query.limit(100),
      ]),
    ]);

    const map = new Map<string, Message>();

    const processDoc = (doc: Record<string, unknown> & { $id: string; $createdAt?: string }) => {
      const senderId = (doc.senderId as string) || (doc.sender_id as string) || '';
      const recipientId = (doc.recipientId as string) || (doc.recipient_id as string) || '';
      const senderName = (doc.senderName as string) || (doc.sender_name as string) || 'User';
      const content = (doc.content as string) || '';
      const createdAt = doc.$createdAt || (doc.createdAt as string) || (doc.CreatedAt as string) || new Date().toISOString();

      map.set(doc.$id, {
        $id: doc.$id,
        senderId,
        recipientId,
        senderName,
        content,
        createdAt,
      });
    };

    resAtoB.documents.forEach((doc) => processDoc(doc as Record<string, unknown> & { $id: string }));
    resBtoA.documents.forEach((doc) => processDoc(doc as Record<string, unknown> & { $id: string }));

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return merged;
  } catch (err: unknown) {
    const errorObj = err as { message?: string; code?: number };
    if (errorObj?.code === 401) {
      throw new Error(
        'Messages collection permission error (401): Please grant Role "Users" Read permission in Appwrite Console -> Databases -> Messages -> Settings -> Permissions.'
      );
    }
    console.error('Error fetching conversation messages:', errorObj);
    throw new Error(
      errorObj.message || 'Failed to load conversation messages. Please check Appwrite permissions and indexes.'
    );
  }
}
