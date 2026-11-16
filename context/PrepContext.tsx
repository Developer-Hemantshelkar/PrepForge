'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from '@/lib/firebase';
import { StackId, STACK_PRESETS } from '@/data/stacks';

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  targetRole: string;
  targetStacks: StackId[];
  masteredConcepts: string[];
}

export interface PracticeAttempt {
  id: string;
  userId: string;
  type: 'quiz' | 'test-module' | 'coding' | 'behavioral';
  stack: string;
  title: string;
  score: number;
  maxScore: number;
  durationSec: number;
  summary: string;
  createdAtMs: number;
}

export interface CareerDocument {
  id: string;
  userId: string;
  docType: 'resume-review' | 'cover-letter' | 'prep-note';
  title: string;
  targetRole: string;
  content: string;
  createdAtMs: number;
  updatedAtMs: number;
}

interface PrepContextValue {
  user: User | null;
  authReady: boolean;
  authError: string | null;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  targetRole: string;
  selectedStacks: StackId[];
  setSelectedStacks: (stacks: StackId[]) => void;
  toggleStackFilter: (stack: StackId) => void;
  applyPreset: (presetId: string) => void;
  updateTargetRole: (role: string) => void;
  masteredConcepts: string[];
  toggleMasteredConcept: (conceptId: string) => Promise<void>;
  attempts: PracticeAttempt[];
  careerDocs: CareerDocument[];
  recordAttempt: (input: {
    type: PracticeAttempt['type'];
    stack: string;
    title: string;
    score: number;
    durationSec?: number;
    summary: string;
  }) => Promise<void>;
  saveCareerDoc: (input: {
    docType: CareerDocument['docType'];
    title: string;
    targetRole: string;
    content: string;
  }) => Promise<void>;
  deleteCareerDoc: (docId: string) => Promise<void>;
}

const PrepContext = createContext<PrepContextValue | null>(null);

function tsToMs(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  if (val && typeof val === 'object' && 'seconds' in val) {
    return Number((val as { seconds: number }).seconds) * 1000;
  }
  return Date.now();
}

export function PrepProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [targetRole, setTargetRoleState] = useState('Full-Stack Software Engineer (Fresher)');
  const [selectedStacks, setSelectedStacksState] = useState<StackId[]>([]);
  const [masteredConcepts, setMasteredConcepts] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [careerDocs, setCareerDocs] = useState<CareerDocument[]>([]);

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubAttempts: (() => void) | null = null;
    let unsubDocs: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) unsubProfile();
      if (unsubAttempts) unsubAttempts();
      if (unsubDocs) unsubDocs();

      setUser(firebaseUser);
      setAuthError(null);

      if (!firebaseUser) {
        setAuthReady(true);
        return;
      }

      const profilePath = `users/${firebaseUser.uid}`;
      const profileRef = doc(db, 'users', firebaseUser.uid);

      try {
        const snap = await getDoc(profileRef);
        if (!snap.exists()) {
          const safeName = (firebaseUser.displayName || 'Fresher Developer').trim().slice(0, 100);
          const safeEmail = (firebaseUser.email || 'user@example.com').trim().slice(0, 150);
          await setDoc(profileRef, {
            uid: firebaseUser.uid,
            displayName: safeName,
            email: safeEmail,
            targetRole: 'Full-Stack Software Engineer (Fresher)',
            targetStacks: [],
            masteredConcepts: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error('Error initializing user profile:', err);
      }

      unsubProfile = onSnapshot(
        profileRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (typeof data.targetRole === 'string') setTargetRoleState(data.targetRole);
            if (Array.isArray(data.targetStacks)) {
              setSelectedStacksState(data.targetStacks as StackId[]);
            }
            if (Array.isArray(data.masteredConcepts)) {
              setMasteredConcepts(data.masteredConcepts as string[]);
            }
          }
          setAuthReady(true);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, profilePath);
        }
      );

      const attemptsPath = `users/${firebaseUser.uid}/attempts`;
      const attemptsQ = query(
        collection(db, 'users', firebaseUser.uid, 'attempts'),
        where('userId', '==', firebaseUser.uid)
      );
      unsubAttempts = onSnapshot(
        attemptsQ,
        (snapshot) => {
          const list: PracticeAttempt[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: String(data.id || d.id),
              userId: String(data.userId || firebaseUser.uid),
              type: (data.type as PracticeAttempt['type']) || 'quiz',
              stack: String(data.stack || 'core-java'),
              title: String(data.title || 'Practice'),
              score: Number(data.score ?? 0),
              maxScore: Number(data.maxScore ?? 100),
              durationSec: Number(data.durationSec ?? 0),
              summary: String(data.summary || ''),
              createdAtMs: tsToMs(data.createdAt),
            };
          });
          list.sort((a, b) => b.createdAtMs - a.createdAtMs);
          setAttempts(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, attemptsPath);
        }
      );

      const docsPath = `users/${firebaseUser.uid}/careerDocs`;
      const docsQ = query(
        collection(db, 'users', firebaseUser.uid, 'careerDocs'),
        where('userId', '==', firebaseUser.uid)
      );
      unsubDocs = onSnapshot(
        docsQ,
        (snapshot) => {
          const list: CareerDocument[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: String(data.id || d.id),
              userId: String(data.userId || firebaseUser.uid),
              docType: (data.docType as CareerDocument['docType']) || 'prep-note',
              title: String(data.title || 'Saved Document'),
              targetRole: String(data.targetRole || ''),
              content: String(data.content || ''),
              createdAtMs: tsToMs(data.createdAt),
              updatedAtMs: tsToMs(data.updatedAt),
            };
          });
          list.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
          setCareerDocs(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, docsPath);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      if (unsubAttempts) unsubAttempts();
      if (unsubDocs) unsubDocs();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with Google.';
      setAuthError(msg);
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setAttempts([]);
    setCareerDocs([]);
    setMasteredConcepts([]);
  }, []);

  const syncProfileFields = useCallback(
    async (updates: Partial<{ targetRole: string; targetStacks: StackId[]; masteredConcepts: string[] }>) => {
      if (!user) return;
      const path = `users/${user.uid}`;
      try {
        const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
        if (updates.targetRole !== undefined) {
          payload.targetRole = (updates.targetRole.trim() || 'Software Engineer').slice(0, 80);
        }
        if (updates.targetStacks !== undefined) {
          payload.targetStacks = updates.targetStacks.slice(0, 8);
        }
        if (updates.masteredConcepts !== undefined) {
          payload.masteredConcepts = updates.masteredConcepts.slice(0, 200);
        }
        await updateDoc(doc(db, 'users', user.uid), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [user]
  );

  const setSelectedStacks = useCallback(
    (stacks: StackId[]) => {
      const bounded = Array.from(new Set(stacks)).slice(0, 8);
      setSelectedStacksState(bounded);
      if (user) {
        syncProfileFields({ targetStacks: bounded }).catch(() => {});
      }
    },
    [user, syncProfileFields]
  );

  const toggleStackFilter = useCallback(
    (stack: StackId) => {
      const next = selectedStacks.includes(stack)
        ? selectedStacks.filter((s) => s !== stack)
        : [...selectedStacks, stack];
      setSelectedStacks(next);
    },
    [selectedStacks, setSelectedStacks]
  );

  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = STACK_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      setSelectedStacksState(preset.stacks);
      setTargetRoleState(preset.targetRole);
      if (user) {
        syncProfileFields({
          targetStacks: preset.stacks,
          targetRole: preset.targetRole,
        }).catch(() => {});
      }
    },
    [user, syncProfileFields]
  );

  const updateTargetRole = useCallback(
    (role: string) => {
      const safe = role.slice(0, 80);
      setTargetRoleState(safe);
      if (user && safe.trim().length > 0) {
        syncProfileFields({ targetRole: safe }).catch(() => {});
      }
    },
    [user, syncProfileFields]
  );

  const toggleMasteredConcept = useCallback(
    async (conceptId: string) => {
      const next = masteredConcepts.includes(conceptId)
        ? masteredConcepts.filter((id) => id !== conceptId)
        : [...masteredConcepts, conceptId].slice(0, 200);
      setMasteredConcepts(next);
      if (user) {
        await syncProfileFields({ masteredConcepts: next });
      }
    },
    [masteredConcepts, user, syncProfileFields]
  );

  const recordAttempt = useCallback(
    async (input: {
      type: PracticeAttempt['type'];
      stack: string;
      title: string;
      score: number;
      durationSec?: number;
      summary: string;
    }) => {
      const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const safeScore = Math.min(100, Math.max(0, Math.round(input.score)));
      const safeDuration = Math.min(14400, Math.max(0, Math.round(input.durationSec ?? 0)));
      const localAttempt: PracticeAttempt = {
        id: attemptId,
        userId: user?.uid || 'guest',
        type: input.type,
        stack: input.stack.slice(0, 64) || 'core-java',
        title: input.title.slice(0, 200) || 'Practice Session',
        score: safeScore,
        maxScore: 100,
        durationSec: safeDuration,
        summary: input.summary.slice(0, 2000),
        createdAtMs: Date.now(),
      };

      if (!user) {
        setAttempts((prev) => [localAttempt, ...prev]);
        return;
      }

      const path = `users/${user.uid}/attempts/${attemptId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'attempts', attemptId), {
          id: attemptId,
          userId: user.uid,
          type: localAttempt.type,
          stack: localAttempt.stack,
          title: localAttempt.title,
          score: localAttempt.score,
          maxScore: 100,
          durationSec: localAttempt.durationSec,
          summary: localAttempt.summary,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [user]
  );

  const saveCareerDoc = useCallback(
    async (input: {
      docType: CareerDocument['docType'];
      title: string;
      targetRole: string;
      content: string;
    }) => {
      const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const safeTitle = (input.title.trim() || 'Untitled Note').slice(0, 200);
      const safeRole = input.targetRole.trim().slice(0, 120);
      const safeContent = (input.content.trim() || 'Empty').slice(0, 15000);

      if (!user) {
        setCareerDocs((prev) => [
          {
            id: docId,
            userId: 'guest',
            docType: input.docType,
            title: safeTitle,
            targetRole: safeRole,
            content: safeContent,
            createdAtMs: Date.now(),
            updatedAtMs: Date.now(),
          },
          ...prev,
        ]);
        return;
      }

      const path = `users/${user.uid}/careerDocs/${docId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'careerDocs', docId), {
          id: docId,
          userId: user.uid,
          docType: input.docType,
          title: safeTitle,
          targetRole: safeRole,
          content: safeContent,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [user]
  );

  const deleteCareerDoc = useCallback(
    async (docId: string) => {
      if (!user) {
        setCareerDocs((prev) => prev.filter((d) => d.id !== docId));
        return;
      }
      const path = `users/${user.uid}/careerDocs/${docId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'careerDocs', docId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user]
  );

  const value = useMemo<PrepContextValue>(
    () => ({
      user,
      authReady,
      authError,
      isSigningIn,
      signInWithGoogle,
      signOut,
      targetRole,
      selectedStacks,
      setSelectedStacks,
      toggleStackFilter,
      applyPreset,
      updateTargetRole,
      masteredConcepts,
      toggleMasteredConcept,
      attempts,
      careerDocs,
      recordAttempt,
      saveCareerDoc,
      deleteCareerDoc,
    }),
    [
      user,
      authReady,
      authError,
      isSigningIn,
      signInWithGoogle,
      signOut,
      targetRole,
      selectedStacks,
      setSelectedStacks,
      toggleStackFilter,
      applyPreset,
      updateTargetRole,
      masteredConcepts,
      toggleMasteredConcept,
      attempts,
      careerDocs,
      recordAttempt,
      saveCareerDoc,
      deleteCareerDoc,
    ]
  );

  return <PrepContext.Provider value={value}>{children}</PrepContext.Provider>;
}

export function usePrep() {
  const ctx = useContext(PrepContext);
  if (!ctx) throw new Error('usePrep must be used inside PrepProvider');
  return ctx;
}
