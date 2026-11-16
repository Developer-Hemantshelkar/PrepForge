'use client';

import React, { useState } from 'react';
import { usePrep } from '@/context/PrepContext';
import { TopBar, NavTab } from './TopBar';
import { StackFilterBar } from './StackFilterBar';
import { OverviewDashboard } from './OverviewDashboard';
import { StudyHub } from './StudyHub';
import { CodingWorkbench } from './CodingWorkbench';
import { TestsAndQuizzes } from './TestsAndQuizzes';
import { CareerAndHR } from './CareerAndHR';
import { StackId } from '@/data/stacks';

export function PrepWorkspace() {
  const { user, isSigningIn, signInWithGoogle, signOut } = usePrep();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [requestedTestStack, setRequestedTestStack] = useState<StackId | null>(null);

  const handleQuickStartTestStack = (stackId: StackId) => {
    setRequestedTestStack(stackId);
    setActiveTab('tests');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        isSigningIn={isSigningIn}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
      />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        <StackFilterBar />

        {activeTab === 'overview' && (
          <OverviewDashboard
            onNavigate={setActiveTab}
            onQuickStartTestStack={handleQuickStartTestStack}
          />
        )}
        {activeTab === 'study' && <StudyHub />}
        {activeTab === 'coding' && <CodingWorkbench />}
        {activeTab === 'tests' && (
          <TestsAndQuizzes
            requestedTestStack={requestedTestStack}
            onClearRequestedTestStack={() => setRequestedTestStack(null)}
          />
        )}
        {activeTab === 'career' && <CareerAndHR />}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>PrepForge · Fresher Software Developer Interview Preparation</div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('study')}
              className="hover:text-slate-900 transition-colors"
            >
              Concept Short Answers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('coding')}
              className="hover:text-slate-900 transition-colors"
            >
              Coding & SQL
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tests')}
              className="hover:text-slate-900 transition-colors"
            >
              Stack Tests
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('career')}
              className="hover:text-slate-900 transition-colors"
            >
              Resume & HR
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
