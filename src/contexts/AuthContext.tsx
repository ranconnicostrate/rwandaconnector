import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as db from '../services/db';
import { AppError } from '../services/db';
import type { Person, Role } from '../types';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthValue {
  status: Status;
  user: Person | null;
  role: Role | null;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (input: db.RegisterInput) => Promise<boolean>;
  /** Signs in with a provider identity; `needs-role` means a new account needs a role first. */
  signInWithIdentity: (
  identity: db.SocialIdentity,
  signup?: {role: Role;companyName?: string;})
  => Promise<'signed-in' | 'needs-role' | 'failed'>;
  setAuthError: (message: string | null) => void;
  signOut: () => void;
  changePassword: (current: string, next: string) => Promise<boolean>;
  pending: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);

  const syncFromSession = useCallback(() => {
    const session = db.readSession();
    if (!session) {
      setUser(null);
      setStatus('anonymous');
      return;
    }
    const record = db.getDatabase().users.find((u) => u.id === session.userId);
    if (!record || record.status === 'SUSPENDED') {
      db.logout();
      setUser(null);
      setStatus('anonymous');
      if (record?.status === 'SUSPENDED') setError('This account has been suspended.');
      return;
    }
    setUser(db.publicUser(record));
    setStatus('authenticated');
  }, []);

  useEffect(() => {
    let cancelled = false;
    db.initDatabase().
    then(() => {
      if (cancelled) return;
      setReady(true);
      syncFromSession();
    }).
    catch(() => {
      if (cancelled) return;
      setError('Local storage is unavailable, so your data cannot be loaded.');
      setStatus('anonymous');
    });
    return () => {
      cancelled = true;
    };
  }, [syncFromSession]);

  // Keep the signed-in user in sync with profile edits and admin suspensions.
  useEffect(() => {
    if (!ready) return undefined;
    return db.subscribe(() => syncFromSession());
  }, [ready, syncFromSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setPending(true);
      setError(null);
      try {
        await db.login(email, password);
        syncFromSession();
        return true;
      } catch (e) {
        setError(e instanceof AppError ? e.message : 'Sign-in failed. Please try again.');
        return false;
      } finally {
        setPending(false);
      }
    },
    [syncFromSession]
  );

  const signUp = useCallback(
    async (input: db.RegisterInput) => {
      setPending(true);
      setError(null);
      try {
        await db.register(input);
        syncFromSession();
        return true;
      } catch (e) {
        setError(e instanceof AppError ? e.message : 'Registration failed. Please try again.');
        return false;
      } finally {
        setPending(false);
      }
    },
    [syncFromSession]
  );

  const signInWithIdentity = useCallback(
    async (identity: db.SocialIdentity, signup?: {role: Role;companyName?: string;}) => {
      setPending(true);
      setError(null);
      try {
        const result = await db.socialSignIn(identity, signup);
        if (result.status === 'needs-role') return 'needs-role' as const;
        syncFromSession();
        return 'signed-in' as const;
      } catch (e) {
        setError(e instanceof AppError ? e.message : 'Sign-in failed. Please try again.');
        return 'failed' as const;
      } finally {
        setPending(false);
      }
    },
    [syncFromSession]
  );

  const signOut = useCallback(() => {
    db.logout();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const changePassword = useCallback(
    async (current: string, next: string) => {
      if (!user) return false;
      setPending(true);
      setError(null);
      try {
        await db.changePassword(user.id, current, next);
        return true;
      } catch (e) {
        setError(e instanceof AppError ? e.message : 'Could not update your password.');
        return false;
      } finally {
        setPending(false);
      }
    },
    [user]
  );

  const value = useMemo<AuthValue>(
    () => ({
      status,
      user,
      role: user?.role ?? null,
      error,
      clearError: () => setError(null),
      signIn,
      signUp,
      signInWithIdentity,
      setAuthError: setError,
      signOut,
      changePassword,
      pending
    }),
    [status, user, error, signIn, signUp, signInWithIdentity, signOut, changePassword, pending]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}