import { ID, Query } from 'appwrite';
import { databases } from './client';
import { appwriteConfig } from './config';
import { UserProfile } from '@/types/user';

export async function createUserProfile(params: {
  userId: string;
  name: string;
  email: string;
}): Promise<UserProfile> {
  const { databaseId, usersCollectionId } = appwriteConfig;
  if (!databaseId || !usersCollectionId) {
    throw new Error('Appwrite database or users collection ID is not configured.');
  }

  // Exact document payload matching required schema
  const documentData = {
    userId: params.userId,
    name: params.name,
    email: params.email,
  };

  try {
    const doc = await databases.createDocument(
      databaseId,
      usersCollectionId,
      params.userId,
      documentData
    );

    return {
      $id: doc.$id,
      userId: (doc.userId as string) || doc.$id,
      name: (doc.name as string) || params.name,
      email: (doc.email as string) || params.email,
      createdAt: (doc.createdAt as string) || doc.$createdAt || new Date().toISOString(),
    };
  } catch (error: unknown) {
    const appwriteErr = error as { code?: number; message?: string };

    // Document with ID = params.userId already exists
    if (appwriteErr?.code === 409) {
      try {
        const existingDoc = await databases.getDocument(
          databaseId,
          usersCollectionId,
          params.userId
        );
        return {
          $id: existingDoc.$id,
          userId: (existingDoc.userId as string) || existingDoc.$id,
          name: (existingDoc.name as string) || params.name,
          email: (existingDoc.email as string) || params.email,
          createdAt: (existingDoc.createdAt as string) || existingDoc.$createdAt || new Date().toISOString(),
        };
      } catch {
        return {
          $id: params.userId,
          userId: params.userId,
          name: params.name,
          email: params.email,
          createdAt: new Date().toISOString(),
        };
      }
    }

    // Fallback if custom document ID is rejected by Appwrite setup
    if (appwriteErr?.code === 400) {
      try {
        const doc = await databases.createDocument(
          databaseId,
          usersCollectionId,
          ID.unique(),
          documentData
        );
        return {
          $id: doc.$id,
          userId: (doc.userId as string) || params.userId,
          name: (doc.name as string) || params.name,
          email: (doc.email as string) || params.email,
          createdAt: (doc.createdAt as string) || doc.$createdAt || new Date().toISOString(),
        };
      } catch (fallbackErr) {
        console.error('Failed to create user profile in fallback:', fallbackErr);
        throw fallbackErr;
      }
    }

    if (appwriteErr?.code === 401) {
      throw new Error(
        'Users collection permission error (401): Please grant Role "Users" Read and Create permissions in Appwrite Console -> Databases -> Users -> Settings -> Permissions.'
      );
    }

    throw error;
  }
}

export async function getUsers(): Promise<UserProfile[]> {
  const { databaseId, usersCollectionId } = appwriteConfig;
  if (!databaseId || !usersCollectionId) {
    throw new Error('Appwrite database or users collection ID is not configured.');
  }

  try {
    const response = await databases.listDocuments(databaseId, usersCollectionId, [
      Query.limit(100),
    ]);

    const usersList = response.documents.map((doc) => ({
      $id: doc.$id,
      userId: (doc.userId as string) || (doc.user_id as string) || doc.$id,
      name: (doc.name as string) || (doc.Name as string) || 'User',
      email: (doc.email as string) || (doc.Email as string) || '',
      createdAt: (doc.createdAt as string) || (doc.CreatedAt as string) || doc.$createdAt || new Date().toISOString(),
    }));

    // Client-side sort by name to avoid requiring an index on Users collection
    usersList.sort((a, b) => a.name.localeCompare(b.name));

    return usersList;
  } catch (error: unknown) {
    const appwriteErr = error as { code?: number; message?: string };
    if (appwriteErr?.code === 401) {
      throw new Error(
        'Users collection permission error (401): Please grant Role "Users" Read access in Appwrite Console -> Databases -> Users -> Settings -> Permissions.'
      );
    }
    throw error;
  }
}
