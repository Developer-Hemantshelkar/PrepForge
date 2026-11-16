'use client';

import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

export type NavTab = 'overview' | 'study' | 'coding' | 'tests' | 'career';

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: User | null;
  isSigningIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

const NAV_ITEMS: { id: NavTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'study', label: 'Study Hub' },
  { id: 'coding', label: 'Code & SQL' },
  { id: 'tests', label: 'Tests & Quizzes' },
  { id: 'career', label: 'Career & HR' },
];

export function TopBar({
  activeTab,
  onSelectTab,
  user,
  isSigningIn,
  onSignIn,
  onSignOut,
}: TopBarProps) {
  const firstName = user?.displayName?.split(' ')[0] || 'Account';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('overview')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          PrepForge
        </button>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 h-full"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`h-full inline-flex items-center text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'border-blue-700 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {user ? (
            <button
              type="button"
              onClick={onSignOut}
              title={`Signed in as ${user.email || user.displayName}. Click to sign out.`}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <UserIcon className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>{firstName}</span>
              <LogOut className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              disabled={isSigningIn}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {isSigningIn ? 'Signing in...' : 'Sign in'}
            </button>
          )}
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Mobile"
        className="md:hidden border-t border-slate-200 px-3 py-1.5 flex items-center gap-1 overflow-x-auto bg-white"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
