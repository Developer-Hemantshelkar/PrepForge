'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { QUESTION_BANK, TEST_MODULES, QuizQuestion, TestModule } from '@/data/quizzes-and-tests';
import { STACKS, getStackLabel, getStackShortLabel, StackId } from '@/data/stacks';
import { usePrep } from '@/context/PrepContext';
import { CheckCircle2, Clock, Sparkles, XCircle } from 'lucide-react';

interface TestsAndQuizzesProps {
  requestedTestStack?: StackId | null;
  onClearRequestedTestStack?: () => void;
}

interface ActiveSession {
  mode: 'test-module' | 'quiz';
  title: string;
  stack: StackId;
  questions: QuizQuestion[];
  durationSec: number;
}

function buildSessionForModule(mod: TestModule): ActiveSession {
  const qs = mod.questionIds
    .map((id) => QUESTION_BANK.find((q) => q.id === id))
    .filter((q): q is QuizQuestion => Boolean(q));
  return {
    mode: 'test-module',
    title: mod.title,
    stack: mod.stack,
    questions: qs,
    durationSec: mod.durationMinutes * 60,
  };
}

export function TestsAndQuizzes({
  requestedTestStack,
  onClearRequestedTestStack,
}: TestsAndQuizzesProps) {
  const { selectedStacks, attempts, recordAttempt } = usePrep();

  const initialSession = (() => {
    if (!requestedTestStack) return null;
    const matched =
      TEST_MODULES.find((m) => m.stack === requestedTestStack) ||
      TEST_MODULES.find((m) => m.id === 'test-projects-hr');
    return matched ? buildSessionForModule(matched) : null;
  })();

  const [session, setSession] = useState<ActiveSession | null>(initialSession);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [remainingSec, setRemainingSec] = useState(initialSession?.durationSec ?? 0);
  const [elapsedSec, setElapsedSec] = useState(0);

  const [aiDifficulty, setAiDifficulty] = useState<'Essential' | 'Intermediate' | 'Mixed'>('Mixed');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const activeStacks: StackId[] = useMemo(
    () => (selectedStacks.length > 0 ? selectedStacks : STACKS.map((s) => s.id)),
    [selectedStacks]
  );

  const visibleModules = useMemo(() => {
    if (selectedStacks.length === 0) return TEST_MODULES;
    const filtered = TEST_MODULES.filter((m) => selectedStacks.includes(m.stack));
    return filtered.length > 0 ? filtered : TEST_MODULES;
  }, [selectedStacks]);

  const startTestModule = (mod: TestModule) => {
    const nextSession = buildSessionForModule(mod);
    setSession(nextSession);
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted(false);
    setRemainingSec(nextSession.durationSec);
    setElapsedSec(0);
    setQuizError(null);
  };

  useEffect(() => {
    if (requestedTestStack) {
      onClearRequestedTestStack?.();
    }
  }, [requestedTestStack, onClearRequestedTestStack]);

  useEffect(() => {
    if (!session || submitted) return;
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
      setRemainingSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [session, submitted]);

  const startCuratedQuiz = () => {
    const pool = QUESTION_BANK.filter((q) => activeStacks.includes(q.stack));
    const source = pool.length > 0 ? pool : QUESTION_BANK;
    const shuffled = [...source].sort(() => Math.random() - 0.5).slice(0, 5);
    const primaryStack = activeStacks.length === 1 ? activeStacks[0] : shuffled[0].stack;
    const title =
      activeStacks.length === 1
        ? `${getStackShortLabel(activeStacks[0])} Focused Quiz`
        : `Multi-Stack Specialized Quiz (${activeStacks.length} stacks)`;

    setSession({
      mode: 'quiz',
      title,
      stack: primaryStack,
      questions: shuffled,
      durationSec: 300,
    });
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted(false);
    setRemainingSec(300);
    setElapsedSec(0);
    setQuizError(null);
  };

  const handleGenerateAiQuiz = async () => {
    setIsGeneratingQuiz(true);
    setQuizError(null);
    try {
      const stackLabels = activeStacks.map((id) => getStackLabel(id));
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stacks: stackLabels,
          difficulty: aiDifficulty,
          count: 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate AI quiz.');
      const rawList = Array.isArray(data.questions) ? data.questions : [];
      if (rawList.length === 0) throw new Error('No questions returned by AI.');

      const formatted: QuizQuestion[] = rawList.map(
        (
          item: {
            stack?: string;
            topic?: string;
            question?: string;
            options?: string[];
            correctIndex?: number;
            explanation?: string;
          },
          i: number
        ) => ({
          id: `ai_q_${Date.now()}_${i}`,
          stack: activeStacks.includes(item.stack as StackId)
            ? (item.stack as StackId)
            : activeStacks[0] || 'core-java',
          topic: item.topic || 'Interview Drill',
          question: item.question || '',
          options: Array.isArray(item.options) ? item.options.slice(0, 4) : [],
          correctIndex: typeof item.correctIndex === 'number' ? item.correctIndex : 0,
          explanation: item.explanation || '',
        })
      );

      const primaryStack = activeStacks[0] || 'core-java';
      setSession({
        mode: 'quiz',
        title:
          activeStacks.length === 1
            ? `AI ${getStackShortLabel(primaryStack)} Specialized Quiz`
            : `AI Multi-Stack Specialized Quiz`,
        stack: primaryStack,
        questions: formatted,
        durationSec: 360,
      });
      setCurrentIdx(0);
      setAnswers({});
      setSubmitted(false);
      setRemainingSec(360);
      setElapsedSec(0);
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : 'Unable to generate quiz.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSubmitSession = async () => {
    if (!session || submitted) return;
    setSubmitted(true);
    const total = session.questions.length;
    const correct = session.questions.reduce((acc, q, idx) => {
      return acc + (answers[idx] === q.correctIndex ? 1 : 0);
    }, 0);
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    await recordAttempt({
      type: session.mode,
      stack: session.stack,
      title: session.title,
      score: pct,
      durationSec: elapsedSec,
      summary: `${correct}/${total} correct (${pct}%) in ${Math.round(elapsedSec / 60)}m ${elapsedSec % 60}s.`,
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const moduleStats = (stack: StackId, title: string) => {
    const matching = attempts.filter(
      (a) => (a.type === 'test-module' && a.title === title) || a.stack === stack
    );
    if (matching.length === 0) return null;
    const latest = matching[0].score;
    const best = Math.max(...matching.map((m) => m.score));
    return { count: matching.length, latest, best };
  };

  // Active Quiz / Test Session View
  if (session) {
    const q = session.questions[currentIdx];
    const answeredCount = Object.keys(answers).length;
    const correctCount = session.questions.reduce(
      (acc, item, idx) => acc + (answers[idx] === item.correctIndex ? 1 : 0),
      0
    );
    const scorePct =
      session.questions.length > 0
        ? Math.round((correctCount / session.questions.length) * 100)
        : 0;

    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              {session.mode === 'test-module' ? 'Timed Growth Test Module' : 'Specialized Stack Quiz'} ·{' '}
              {getStackLabel(session.stack)}
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">{session.title}</h1>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>{submitted ? `Completed in ${formatTimer(elapsedSec)}` : formatTimer(remainingSec)}</span>
            </div>
            <button
              type="button"
              onClick={() => setSession(null)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md"
            >
              Exit to Modules
            </button>
          </div>
        </div>

        {/* Question Navigator Strip */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center flex-wrap gap-1.5">
            {session.questions.map((item, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered = answers[idx] !== undefined;
              const isCorrect = submitted && answers[idx] === item.correctIndex;
              const isWrong = submitted && answers[idx] !== item.correctIndex;

              let style = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
              if (submitted) {
                style = isCorrect
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                  : isWrong
                  ? 'bg-red-50 border-red-500 text-red-900'
                  : style;
              } else if (isCurrent) {
                style = 'bg-blue-700 border-blue-700 text-white';
              } else if (isAnswered) {
                style = 'bg-blue-50 border-blue-300 text-blue-900';
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-9 h-9 text-xs font-mono tabular-nums font-medium rounded-md border transition-colors ${style}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono tabular-nums text-slate-600">
            {answeredCount} / {session.questions.length} answered
          </div>
        </div>

        {/* Summary Banner after Submit */}
        {submitted && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-slate-500">Assessment Complete · Saved to Growth Dashboard</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {scorePct}% ({correctCount} / {session.questions.length} correct)
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {scorePct >= 75
                  ? 'Strong mastery on this stack. Review any missed explanations below.'
                  : 'Review the explanations below and revisit weak topics in Study Hub.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSession(null)}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md whitespace-nowrap self-start sm:self-auto"
            >
              Back to Tests & Quizzes
            </button>
          </div>
        )}

        {/* Active Question Card */}
        {q && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            <div>
              <div className="text-xs text-slate-500">
                Question {currentIdx + 1} of {session.questions.length} · {getStackShortLabel(q.stack)} · {q.topic}
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mt-1.5 leading-snug">
                {q.question}
              </h2>
            </div>

            <div className="space-y-2.5">
              {q.options.map((option, optIdx) => {
                const isSelected = answers[currentIdx] === optIdx;
                const isRightOption = submitted && optIdx === q.correctIndex;
                const isWrongSelected = submitted && isSelected && optIdx !== q.correctIndex;

                let btnClass = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50';
                if (isRightOption) {
                  btnClass = 'bg-emerald-50 border-emerald-600 text-emerald-950';
                } else if (isWrongSelected) {
                  btnClass = 'bg-red-50 border-red-500 text-red-950';
                } else if (isSelected) {
                  btnClass = 'bg-blue-50 border-blue-600 text-blue-950';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }))}
                    className={`w-full text-left p-4 rounded-md border text-sm transition-colors flex items-start justify-between gap-3 ${btnClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-semibold mt-0.5 text-slate-500">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span>{option}</span>
                    </div>
                    {isRightOption && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    {isWrongSelected && (
                      <XCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
                <div className="text-xs font-semibold text-slate-800">Explanation</div>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{q.explanation}</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-md"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < session.questions.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIdx((i) => Math.min(session.questions.length - 1, i + 1))
                    }
                    className="px-4 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md"
                  >
                    Next Question
                  </button>
                )}
                {!submitted && (
                  <button
                    type="button"
                    onClick={handleSubmitSession}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md"
                  >
                    Submit & Grade
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default Hub: Specialized Quizzes + Growth Test Modules
  return (
    <div className="space-y-6">
      {/* Specialized Stack-Filtered Quiz Launcher */}
      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-slate-500">
              Active Target Scope: {activeStacks.map(getStackShortLabel).join(' · ')}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Specialized Quizzes for Your Target Tech Stack
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Launch an instant 5-question drill drawn from your selected stacks, or generate a brand-new AI quiz tailored to your focus areas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <select
              aria-label="AI quiz difficulty"
              value={aiDifficulty}
              onChange={(e) =>
                setAiDifficulty(e.target.value as 'Essential' | 'Intermediate' | 'Mixed')
              }
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700"
            >
              <option value="Mixed">Mixed Difficulty</option>
              <option value="Essential">Fresher Essential</option>
              <option value="Intermediate">Intermediate</option>
            </select>

            <button
              type="button"
              onClick={startCuratedQuiz}
              className="px-4 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              Start Instant Stack Quiz
            </button>

            <button
              type="button"
              onClick={handleGenerateAiQuiz}
              disabled={isGeneratingQuiz}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isGeneratingQuiz ? 'Generating Quiz...' : 'Generate Fresh AI Quiz'}</span>
            </button>
          </div>
        </div>

        {quizError && (
          <p className="mt-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {quizError}
          </p>
        )}
      </section>

      {/* Stack-Specific Timed Test Modules */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Stack Growth Test Modules
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Timed assessments per technical track. Each completed module updates your Growth Dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleModules.map((mod) => {
            const stats = moduleStats(mod.stack, mod.title);
            return (
              <div
                key={mod.id}
                className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>{getStackShortLabel(mod.stack)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{mod.questionIds.length} questions</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{mod.durationMinutes} min</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mt-1.5">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div className="text-xs font-mono tabular-nums text-slate-600">
                    {stats ? (
                      <span>
                        Best {stats.best}% · {stats.count} {stats.count === 1 ? 'run' : 'runs'}
                      </span>
                    ) : (
                      <span>Not attempted</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startTestModule(mod)}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
                  >
                    Start Test
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
