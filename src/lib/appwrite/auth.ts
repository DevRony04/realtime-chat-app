import { ID } from 'appwrite';
import { account } from './client';
import { createUserProfile } from './users';
import { AuthUser } from '@/types/auth';

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const user = await account.get();
    return {
      $id: user.$id,
      name: user.name,
      email: user.email,
    };
  } catch {
    return null;
  }
}

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthUser> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName || !trimmedEmail || !password) {
    throw new Error('Name, email, and password are required.');
  }

  // Clear any existing active session before creating account & session
  try {
    await account.deleteSession('current');
  } catch {
    // Ignore if no active session
  }

  // 1. Create Appwrite Auth Account
  const userId = ID.unique();
  let createdUser;
  try {
    createdUser = await account.create(userId, trimmedEmail, password, trimmedName);
  } catch (err: unknown) {
    const appwriteErr = err as { message?: string; code?: number };
    if (appwriteErr.code === 409) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }
    throw new Error(appwriteErr.message || 'Failed to create Appwrite account.');
  }

  // 2. Create Session immediately using email & password
  try {
    await account.createEmailPasswordSession(trimmedEmail, password);
  } catch (err: unknown) {
    const appwriteErr = err as { message?: string };
    throw new Error(appwriteErr.message || 'Account created, but failed to start session. Please try signing in.');
  }

  // 3. Obtain the authenticated user using Account API (confirming active session)
  const currentUser = await account.get();
  if (!currentUser || !currentUser.$id) {
    throw new Error('Failed to retrieve authenticated user session.');
  }

  // 4. Create corresponding profile row in Users Database collection
  try {
    await createUserProfile({
      userId: currentUser.$id,
      name: trimmedName,
      email: currentUser.email || trimmedEmail,
    });
  } catch (err: unknown) {
    const appwriteErr = err as { message?: string };
    console.error('Failed to create user profile row in Users table:', appwriteErr);
    throw new Error(
      appwriteErr.message ||
        'Account created and session active, but profile creation in Users database table failed. Please check Appwrite Users collection permissions.'
    );
  }

  return {
    $id: currentUser.$id,
    name: currentUser.name || trimmedName,
    email: currentUser.email || trimmedEmail,
  };
}

export async function login(
  email: string,
  password: string
): Promise<AuthUser> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    throw new Error('Email and password are required.');
  }

  // Clear any pre-existing active session to avoid "session is active" conflicts
  try {
    await account.deleteSession('current');
  } catch {
    // No active session to delete, proceed
  }

  // 1. Create email/password session
  try {
    await account.createEmailPasswordSession(trimmedEmail, password);
  } catch (err: unknown) {
    const appwriteErr = err as { message?: string; code?: number };
    if (appwriteErr.code === 401) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }
    throw new Error(appwriteErr.message || 'Login failed. Please check your network and credentials.');
  }

  // 2. Retrieve current authenticated user
  const user = await account.get();

  // 3. Ensure profile row exists in Users database collection
  try {
    await createUserProfile({
      userId: user.$id,
      name: user.name || 'User',
      email: user.email || trimmedEmail,
    });
  } catch (err) {
    console.warn('Profile creation/verification warning on login:', err);
  }

  return {
    $id: user.$id,
    name: user.name || 'User',
    email: user.email || trimmedEmail,
  };
}

export async function logout(): Promise<void> {
  try {
    await account.deleteSession('current');
  } catch (err) {
    console.warn('Logout session deletion warning:', err);
  }
}
