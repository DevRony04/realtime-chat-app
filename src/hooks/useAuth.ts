'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '@/types/auth';
import { getCurrentUser, login as apiLogin, signUp as apiSignUp, logout as apiLogout } from '@/lib/appwrite/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch session';
      setError(message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getCurrentUser()
      .then((currentUser) => {
        if (!ignore) {
          setUser(currentUser);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Failed to fetch session';
          setError(message);
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const loginUser = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await apiLogin(email, pass);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpUser = async (email: string, pass: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await apiSignUp(email, pass, name);
      setUser(newUser);
      return newUser;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiLogout();
      setUser(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login: loginUser,
    signup: signUpUser,
    logout: logoutUser,
    refreshUser: fetchUser,
  };
}
