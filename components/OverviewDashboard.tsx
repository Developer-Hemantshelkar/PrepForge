'use client';

import React, { useMemo, useState } from 'react';
import { usePrep } from '@/context/PrepContext';
import { STACKS, getStackShortLabel, StackId } from '@/data/stacks';
import { CONCEPTS } from '@/data/concepts';
import { NavTab } from './TopBar';
import { ArrowRight, CheckCircle2, ClipboardList, Code2, BookOpen, MessageSquare } from 'lucide-react';

interface OverviewDashboardProps {
  onNavigate: (tab: NavTab) => void;
  onQuickStartTestStack: (stackId: StackId) => void;
}

export function OverviewDashboard({
  onNavigate,
  onQuickStartTestStack,
}: OverviewDashboardProps) {
  const {
    user,
    signInWithGoogle,
    isSigningIn,
    authError,
    targetRole,
    updateTargetRole,
    selectedStacks,
    masteredConcepts,
    attempts,
  } = usePrep();

  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [roleSavedNote, setRoleSavedNote] = useState(false);
  const roleDraft = editingRole ?? targetRole;

  const activeStackIds: StackId[] = useMemo(
    () => (selectedStacks.length > 0 ? selectedStacks : STACKS.map((s) => s.id)),
    [selectedStacks]
  );

  const visibleConcepts = useMemo(
    () => CONCEPTS.filter((c) => activeStackIds.includes(c.stack)),
    [activeStackIds]
  );

  const masteredVisibleCount = useMemo(
    () => visibleConcepts.filter((c) => masteredConcepts.includes(c.id)).length,
    [visibleConcepts, masteredConcepts]
  );

  const averageScore = useMemo(() => {
    if (attempts.length === 0) return null;
    const sum = attempts.reduce((acc, a) => acc + a.score, 0);
    return Math.round(sum / attempts.length);
  }, [attempts]);

  const stackMetrics = useMemo(() => {
    return STACKS.filter((s) => activeStackIds.includes(s.id)).map((stack) => {
      const totalConcepts = CONCEPTS.filter((c) => c.stack === stack.id).length;
      const mastered = CONCEPTS.filter(
        (c) => c.stack === stack.id && masteredConcepts.includes(c.id)
      ).length;
      const stackAttempts = attempts.filter((a) => a.stack === stack.id);
      const latestScore = stackAttempts.length > 0 ? stackAttempts[0].score : null;
      const avgStackScore =
        stackAttempts.length > 0
          ? Math.round(
              stackAttempts.reduce((acc, a) => acc + a.score, 0) / stackAttempts.length
            )
          : null;
      const readinessPct =
        totalConcepts > 0
          ? Math.round(
              (mastered / totalConcepts) * (avgStackScore !== null ? 55 : 100) +
                (avgStackScore !== null ? avgStackScore * 0.45 : 0)
            )
          : 0;

      return {
        stack,
        totalConcepts,
        mastered,
        attemptCount: stackAttempts.length,
        latestScore,
        avgStackScore,
        readinessPct,
      };
    });
  }, [activeStackIds, masteredConcepts, attempts]);

  const recommendedFocus = useMemo(() => {
    if (stackMetrics.length === 0) return null;
    const sorted = [...stackMetrics].sort((a, b) => a.readinessPct - b.readinessPct);
    return sorted[0];
  }, [stackMetrics]);

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleDraft.trim()) return;
    updateTargetRole(roleDraft.trim());
    setEditingRole(null);
    setRoleSavedNote(true);
    setTimeout(() => setRoleSavedNote(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero / Account Context Banner */}
      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-slate-500">
              {user
                ? `Signed in as ${user.displayName || user.email} · Synced to your Growth Dashboard`
                : 'Guest Practice Mode · Sign in with Google to save growth metrics across sessions'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1 text-balance">
              Fresher Software Engineering Interview Workbench
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              Master concise interview-ready short answers, run stack-filtered quizzes and timed growth tests, practice coding and behavioral answers with AI feedback, and refine your resume.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {!user && (
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={isSigningIn}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
              >
                {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('tests')}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2 ${
                user
                  ? 'bg-blue-700 text-white hover:bg-blue-800'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <span>Run Stack Test</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {authError && (
          <p className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {authError}
          </p>
        )}

        {/* Target role quick customization */}
        <form
          onSubmit={handleSaveRole}
          className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <label htmlFor="target-role-input" className="text-xs font-medium text-slate-600 shrink-0">
            Target Role:
          </label>
          <input
            id="target-role-input"
            type="text"
            maxLength={80}
            value={roleDraft}
            onChange={(e) => setEditingRole(e.target.value)}
            placeholder="e.g. Full-Stack Java Developer (Fresher)"
            className="flex-1 max-w-md px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            {roleSavedNote ? 'Saved' : 'Update role'}
          </button>
        </form>
      </section>

      {/* 4-column KPI Strip */}
      <section aria-label="Growth metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Concepts Interview-Ready</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {masteredVisibleCount}
            </span>
            <span className="text-sm font-mono tabular-nums text-slate-500">
              / {visibleConcepts.length}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Across {activeStackIds.length} active stacks
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Practice & Test Attempts</div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {attempts.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Quizzes, timed tests, code & HR drills
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Average Assessment Score</div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {averageScore !== null ? `${averageScore}%` : '—'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {averageScore !== null
              ? averageScore >= 75
                ? 'Strong interview readiness'
                : 'Keep drilling weak stacks'
              : 'Complete a quiz or code review'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Recommended Next Focus</div>
          <div className="mt-2 text-lg font-semibold text-slate-900 truncate">
            {recommendedFocus ? recommendedFocus.stack.shortLabel : 'All Caught Up'}
          </div>
          {recommendedFocus && (
            <button
              type="button"
              onClick={() => onQuickStartTestStack(recommendedFocus.stack.id)}
              className="mt-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
            >
              <span>Test {recommendedFocus.stack.shortLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      {/* Tech Stack Growth Breakdown Table */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Tech Stack Growth & Readiness Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track concept mastery and test performance separately for each target stack.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('study')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              Open Study Hub
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Tech Stack</th>
                <th className="py-3 px-4">Subtopics</th>
                <th className="py-3 px-4 text-right">Concepts Mastered</th>
                <th className="py-3 px-4 text-right">Latest Score</th>
                <th className="py-3 px-4 w-40">Readiness</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {stackMetrics.map(({ stack, totalConcepts, mastered, latestScore, readinessPct }) => (
                <tr key={stack.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-900 whitespace-nowrap">
                    {stack.label}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                    {stack.subtopics.join(' · ')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    {mastered} / {totalConcepts}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    {latestScore !== null ? `${latestScore}%` : 'Not tested'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            readinessPct >= 75
                              ? 'bg-emerald-600'
                              : readinessPct >= 40
                              ? 'bg-blue-600'
                              : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.min(100, readinessPct)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono tabular-nums text-slate-600 w-9 text-right">
                        {readinessPct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onQuickStartTestStack(stack.id)}
                      className="text-xs font-medium text-blue-700 hover:text-blue-900"
                    >
                      Take Test
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Launch Modules & Recent Growth Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Complete Interview Preparation Modules
          </h2>
          <div className="divide-y divide-slate-200">
            <button
              type="button"
              onClick={() => onNavigate('study')}
              className="w-full py-3 flex items-start gap-3 text-left hover:bg-slate-50 px-2 -mx-2 rounded-md transition-colors"
            >
              <BookOpen className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Study Hub — Interview-Ready Short Answers
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  30+ core concepts across Java, SQL, DSA, Spring Boot, React, Projects & HR.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('coding')}
              className="w-full py-3 flex items-start gap-3 text-left hover:bg-slate-50 px-2 -mx-2 rounded-md transition-colors"
            >
              <Code2 className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Mock Coding & SQL Workbench with AI Feedback
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Write Java, SQL, or JS solutions and receive complexity, edge-case & clean code reviews.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('tests')}
              className="w-full py-3 flex items-start gap-3 text-left hover:bg-slate-50 px-2 -mx-2 rounded-md transition-colors"
            >
              <ClipboardList className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Specialized Stack Quizzes & Timed Test Modules
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Measure growth per tech stack or generate fresh AI interview drills.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('career')}
              className="w-full py-3 flex items-start gap-3 text-left hover:bg-slate-50 px-2 -mx-2 rounded-md transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  HR Coach, Resume Refinement & Cover Letter Studio
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Practice STAR answers, refine ATS resume bullets, and run live AI mock interviews.
                </div>
              </div>
            </button>
          </div>
        </section>

        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Growth Activity</h2>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {attempts.length} recorded
            </span>
          </div>

          {attempts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" aria-hidden="true" />
              <div className="text-sm font-medium text-slate-900 mt-3">
                No assessments or practice evaluations logged yet
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Complete a stack test module, submit a coding solution, or practice a behavioral response to see your growth timeline here.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('tests')}
                className="mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors"
              >
                Start First Assessment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {attempts.slice(0, 7).map((item) => (
                <div
                  key={item.id}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{getStackShortLabel(item.stack as StackId)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{item.type.replace('-', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(item.createdAtMs).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-semibold font-mono tabular-nums ${
                        item.score >= 75
                          ? 'text-emerald-700'
                          : item.score >= 50
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {item.score}%
                    </span>
                    <div className="text-[11px] text-slate-500">
                      {item.score >= 75 ? 'Proficient' : item.score >= 50 ? 'Developing' : 'Needs Review'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
