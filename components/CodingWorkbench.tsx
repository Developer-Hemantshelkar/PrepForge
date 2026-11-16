'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CODING_CHALLENGES, CodingChallenge } from '@/data/challenges';
import { STACKS, getStackShortLabel, StackId } from '@/data/stacks';
import { usePrep } from '@/context/PrepContext';
import { Lightbulb, Play, RotateCcw, Sparkles } from 'lucide-react';

interface CodeEvaluationResult {
  score: number;
  verdict: string;
  timeComplexity: string;
  spaceComplexity: string;
  strengths: string[];
  edgeCasesMissed: string[];
  codeQualityNotes: string;
  improvedSolution: string;
  nextStep: string;
}

export function CodingWorkbench() {
  const { selectedStacks, recordAttempt } = usePrep();

  const [customChallenges, setCustomChallenges] = useState<CodingChallenge[]>([]);
  const [activeId, setActiveId] = useState<string>(CODING_CHALLENGES[0].id);
  const [codeDraft, setCodeDraft] = useState<string>(CODING_CHALLENGES[0].starterCode);
  const [showHints, setShowHints] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<CodeEvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genStack, setGenStack] = useState<StackId>('dsa');
  const [genLang, setGenLang] = useState<'java' | 'sql' | 'javascript'>('java');
  const [copiedSolution, setCopiedSolution] = useState(false);

  const allChallenges = useMemo(
    () => [...customChallenges, ...CODING_CHALLENGES],
    [customChallenges]
  );

  const filteredChallenges = useMemo(() => {
    if (selectedStacks.length === 0) return allChallenges;
    const matches = allChallenges.filter((c) => selectedStacks.includes(c.stack));
    return matches.length > 0 ? matches : allChallenges;
  }, [allChallenges, selectedStacks]);

  const activeChallenge = useMemo(
    () =>
      filteredChallenges.find((c) => c.id === activeId) || filteredChallenges[0],
    [filteredChallenges, activeId]
  );

  const activeChallengeId = activeChallenge?.id;

  const selectChallenge = (challenge: CodingChallenge) => {
    setActiveId(challenge.id);
    setCodeDraft(challenge.starterCode);
    setEvaluation(null);
    setEvalError(null);
    setShowHints(false);
    setElapsedSec(0);
  };

  useEffect(() => {
    if (!activeChallengeId) return;
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeChallengeId]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = codeDraft.substring(0, start) + '  ' + codeDraft.substring(end);
      setCodeDraft(next);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  const handleEvaluate = async () => {
    if (!activeChallenge) return;
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const res = await fetch('/api/ai/evaluate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeChallenge.title,
          prompt: activeChallenge.prompt,
          language: activeChallenge.language,
          stack: getStackShortLabel(activeChallenge.stack),
          code: codeDraft,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate code.');
      }
      setEvaluation(data as CodeEvaluationResult);
      await recordAttempt({
        type: 'coding',
        stack: activeChallenge.stack,
        title: activeChallenge.title,
        score: Number(data.score ?? 0),
        durationSec: elapsedSec,
        summary: `${data.verdict} (${data.timeComplexity || 'N/A'}) — ${data.codeQualityNotes || ''}`,
      });
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : 'Unable to evaluate solution.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    setEvalError(null);
    try {
      const res = await fetch('/api/ai/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stack: genStack,
          language: genLang,
          difficulty: 'Easy',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate challenge.');
      const c = data.challenge;
      const newChallenge: CodingChallenge = {
        id: `ai_${Date.now()}`,
        stack: genStack,
        topic: c.topic || 'Custom Drill',
        title: c.title || 'AI Mock Coding Challenge',
        difficulty: c.difficulty === 'Medium' ? 'Medium' : 'Easy',
        language: genLang,
        prompt: c.prompt || '',
        sampleIO: c.sampleIO || '',
        constraints: c.constraints || '',
        starterCode: c.starterCode || '',
        hints: Array.isArray(c.hints) ? c.hints : [],
      };
      setCustomChallenges((prev) => [newChallenge, ...prev]);
      selectChallenge(newChallenge);
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : 'Could not generate challenge.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyImproved = async () => {
    if (!evaluation?.improvedSolution) return;
    try {
      await navigator.clipboard.writeText(evaluation.improvedSolution);
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Challenge Selector & AI Generator Toolbar */}
      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Mock Coding & SQL Workbench
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Solve fresher interview challenges in Java, SQL, or JavaScript and receive structured AI interviewer feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Challenge stack for AI generator"
              value={genStack}
              onChange={(e) => {
                const s = e.target.value as StackId;
                setGenStack(s);
                if (s === 'sql-dbms') setGenLang('sql');
                else if (s === 'frontend') setGenLang('javascript');
                else setGenLang('java');
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700"
            >
              {STACKS.filter((s) =>
                ['dsa', 'core-java', 'sql-dbms', 'spring-boot', 'frontend'].includes(s.id)
              ).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shortLabel}
                </option>
              ))}
            </select>
            <select
              aria-label="Language for AI generator"
              value={genLang}
              onChange={(e) => setGenLang(e.target.value as 'java' | 'sql' | 'javascript')}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700"
            >
              <option value="java">Java</option>
              <option value="sql">SQL</option>
              <option value="javascript">JavaScript</option>
            </select>
            <button
              type="button"
              onClick={handleGenerateChallenge}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isGenerating ? 'Generating...' : 'Generate AI Challenge'}</span>
            </button>
          </div>
        </div>

        {/* Challenge Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 overflow-x-auto pb-1">
          {filteredChallenges.map((c) => {
            const active = c.id === activeChallenge?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectChallenge(c)}
                className={`px-3 py-2 text-left rounded-md border transition-colors shrink-0 ${
                  active
                    ? 'bg-blue-50 border-blue-600 text-blue-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-semibold whitespace-nowrap">{c.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
                  {getStackShortLabel(c.stack)} · {c.language.toUpperCase()} · {c.difficulty}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Two-Zone Coding Stage */}
      {activeChallenge && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Problem Statement */}
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <div className="text-xs text-slate-500">
                {getStackShortLabel(activeChallenge.stack)} · {activeChallenge.topic} ·{' '}
                {activeChallenge.difficulty}
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mt-1">
                {activeChallenge.title}
              </h2>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {activeChallenge.prompt}
            </p>

            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1.5">
                Sample Input / Output
              </div>
              <pre className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 whitespace-pre-wrap">
                {activeChallenge.sampleIO}
              </pre>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1">
                Constraints & Expectations
              </div>
              <p className="text-xs text-slate-600">{activeChallenge.constraints}</p>
            </div>

            {activeChallenge.hints.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowHints((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900"
                >
                  <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{showHints ? 'Hide Hints' : 'Need a Hint?'}</span>
                </button>
                {showHints && (
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                    {activeChallenge.hints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          {/* Right: Code Editor + AI Evaluation */}
          <section className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="font-mono font-medium uppercase text-slate-900">
                    {activeChallenge.language}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Elapsed {formatDuration(elapsedSec)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCodeDraft(activeChallenge.starterCode);
                      setEvaluation(null);
                      setEvalError(null);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleEvaluate}
                    disabled={isEvaluating}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isEvaluating ? 'Evaluating...' : 'Evaluate with AI'}</span>
                  </button>
                </div>
              </div>

              <textarea
                aria-label="Code solution editor"
                value={codeDraft}
                onChange={(e) => setCodeDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                rows={15}
                className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-950 text-slate-100 focus:outline-none resize-y leading-relaxed"
              />
            </div>

            {evalError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                {evalError}
              </div>
            )}

            {evaluation && (
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      AI Interviewer Code Review
                    </div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {evaluation.verdict}
                    </div>
                  </div>
                  <div className="flex items-center gap-5 font-mono tabular-nums">
                    <div>
                      <div className="text-[11px] text-slate-500">Score</div>
                      <div
                        className={`text-xl font-bold ${
                          evaluation.score >= 75
                            ? 'text-emerald-700'
                            : evaluation.score >= 50
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {evaluation.score}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Time</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {evaluation.timeComplexity}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Space</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {evaluation.spaceComplexity}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-md">
                    <div className="text-xs font-semibold text-emerald-900 mb-2">
                      What Worked Well
                    </div>
                    <ul className="space-y-1 text-xs text-emerald-900 list-disc pl-4">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-md">
                    <div className="text-xs font-semibold text-amber-900 mb-2">
                      Edge Cases & Fixes
                    </div>
                    <ul className="space-y-1 text-xs text-amber-900 list-disc pl-4">
                      {evaluation.edgeCasesMissed.length > 0 ? (
                        evaluation.edgeCasesMissed.map((e, i) => <li key={i}>{e}</li>)
                      ) : (
                        <li>No critical edge cases missed.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">
                    Code Quality & Interview Communication
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {evaluation.codeQualityNotes}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">
                      Reference Improved Solution
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyImproved}
                      className="text-xs text-blue-700 hover:text-blue-900 font-medium"
                    >
                      {copiedSolution ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                  <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-md text-xs font-mono overflow-x-auto leading-relaxed">
                    <code>{evaluation.improvedSolution}</code>
                  </pre>
                </div>

                <div className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">Next Step: </span>
                  {evaluation.nextStep}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
