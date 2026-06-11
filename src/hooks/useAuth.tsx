import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { useI18n, type TranslationKey } from '@/i18n/I18nProvider';
import { auth } from '@/lib/firebase';
import {
  registerWithEmail,
  sendResetPasswordEmail,
  signInWithEmail,
  signOutCurrentUser,
} from '@/services/authService';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  register: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function getAuthErrorKey(error: unknown): TranslationKey {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'auth.error.emailInUse';
    case 'auth/invalid-email':
      return 'auth.error.invalidEmail';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'auth.error.invalidCredential';
    case 'auth/weak-password':
      return 'auth.error.weakPassword';
    case 'auth/network-request-failed':
      return 'auth.error.network';
    default:
      return 'auth.error.default';
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setError(null);

    try {
      await registerWithEmail(email, password);
    } catch (registerError) {
      const message = t(getAuthErrorKey(registerError));
      setError(message);
      throw new Error(message);
    }
  }, [t]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);

    try {
      await signInWithEmail(email, password);
    } catch (signInError) {
      const message = t(getAuthErrorKey(signInError));
      setError(message);
      throw new Error(message);
    }
  }, [t]);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);

    try {
      await sendResetPasswordEmail(email);
    } catch (resetError) {
      const message = t(getAuthErrorKey(resetError));
      setError(message);
      throw new Error(message);
    }
  }, [t]);

  const signOut = useCallback(async () => {
    setError(null);
    await signOutCurrentUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      clearError,
      register,
      resetPassword,
      signIn,
      signOut,
    }),
    [clearError, error, isLoading, register, resetPassword, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
