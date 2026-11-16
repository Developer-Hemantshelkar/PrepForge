'use client';

import React, { useState } from 'react';
import { BEHAVIORAL_PROMPTS, INTERVIEW_PLAYBOOK } from '@/data/challenges';
import { STACKS, getStackLabel } from '@/data/stacks';
import { usePrep } from '@/context/PrepContext';
import { Bookmark, Check, Copy, Send, Sparkles, Trash2 } from 'lucide-react';

type CareerSubTab = 'behavioral' | 'resume' | 'cover-letter' | 'strategy';

interface BehavioralFeedback {
  clarityScore: number;
  starBreakdown: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  strengths: string[];
  redFlags: string[];
  polishedAnswer: string;
  followUpQuestion: string;
}

interface ResumeRefineResult {
  summaryVerdict: string;
  strongPoints: string[];
  missingKeywords: string[];
  rewrittenBullets: {
    original: string;
    improved: string;
    whyBetter: string;
  }[];
  actionChecklist: string[];
}

interface MockTurn {
  role: 'interviewer' | 'candidate';
  text: string;
  feedback?: string;
  hint?: string;
}

export function CareerAndHR() {
  const { targetRole, selectedStacks, careerDocs, recordAttempt, saveCareerDoc, deleteCareerDoc } =
    usePrep();

  const [subTab, setSubTab] = useState<CareerSubTab>('behavioral');

  // Behavioral state
  const [selectedPromptId, setSelectedPromptId] = useState(BEHAVIORAL_PROMPTS[0].id);
  const [customQuestion, setCustomQuestion] = useState('');
  const [behavioralDraft, setBehavioralDraft] = useState('');
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [isEvaluatingBeh, setIsEvaluatingBeh] = useState(false);
  const [behFeedback, setBehFeedback] = useState<BehavioralFeedback | null>(null);
  const [behError, setBehError] = useState<string | null>(null);

  // Resume state
  const [resumeInput, setResumeInput] = useState('');
  const [isRefiningResume, setIsRefiningResume] = useState(false);
  const [resumeResult, setResumeResult] = useState<ResumeRefineResult | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeSavedMsg, setResumeSavedMsg] = useState(false);

  // Cover letter state
  const [companyName, setCompanyName] = useState('');
  const [coverRole, setCoverRole] = useState(targetRole);
  const [background, setBackground] = useState('B.Tech Computer Science graduate (2026) with strong Java, SQL & React fundamentals');
  const [keyProjects, setKeyProjects] = useState('');
  const [tone, setTone] = useState('Confident, concise, engineering-focused');
  const [isDraftingLetter, setIsDraftingLetter] = useState(false);
  const [letterResult, setLetterResult] = useState<{ subjectLine: string; coverLetter: string } | null>(
    null
  );
  const [letterError, setLetterError] = useState<string | null>(null);
  const [letterCopied, setLetterCopied] = useState(false);
  const [letterSavedMsg, setLetterSavedMsg] = useState(false);

  // Live Mock Interviewer state
  const [mockStack, setMockStack] = useState('Core Java, SQL & Spring Boot');
  const [mockHistory, setMockHistory] = useState<MockTurn[]>([]);
  const [mockInput, setMockInput] = useState('');
  const [isMockLoading, setIsMockLoading] = useState(false);
  const [mockError, setMockError] = useState<string | null>(null);
  const [showMockHintIdx, setShowMockHintIdx] = useState<number | null>(null);

  const activePrompt =
    BEHAVIORAL_PROMPTS.find((p) => p.id === selectedPromptId) || BEHAVIORAL_PROMPTS[0];

  const handleEvaluateBehavioral = async () => {
    setIsEvaluatingBeh(true);
    setBehError(null);
    const questionText = customQuestion.trim() || activePrompt.question;
    const topicText = customQuestion.trim() ? 'Custom HR / Behavioral' : activePrompt.topic;
    try {
      const res = await fetch('/api/ai/evaluate-behavioral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          topic: topicText,
          answer: behavioralDraft,
          targetRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to evaluate behavioral answer.');
      setBehFeedback(data as BehavioralFeedback);
      await recordAttempt({
        type: 'behavioral',
        stack: 'hr-behavioral',
        title: topicText,
        score: Number(data.clarityScore ?? 0),
        durationSec: 120,
        summary: `Clarity ${data.clarityScore}/100 — ${data.polishedAnswer?.slice(0, 140) || ''}`,
      });
    } catch (err) {
      setBehError(err instanceof Error ? err.message : 'Unable to evaluate answer.');
    } finally {
      setIsEvaluatingBeh(false);
    }
  };

  const handleRefineResume = async () => {
    setIsRefiningResume(true);
    setResumeError(null);
    setResumeSavedMsg(false);
    try {
      const stackLabels =
        selectedStacks.length > 0
          ? selectedStacks.map((id) => getStackLabel(id))
          : STACKS.map((s) => s.label);
      const res = await fetch('/api/ai/career-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'resume-refine',
          resumeText: resumeInput,
          targetRole,
          targetStacks: stackLabels,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze resume.');
      setResumeResult(data as ResumeRefineResult);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : 'Unable to refine resume.');
    } finally {
      setIsRefiningResume(false);
    }
  };

  const handleSaveResumeReview = async () => {
    if (!resumeResult) return;
    const md = [
      `Verdict: ${resumeResult.summaryVerdict}`,
      '',
      'Missing ATS Keywords:',
      ...resumeResult.missingKeywords.map((k) => `- ${k}`),
      '',
      'Improved Bullets:',
      ...resumeResult.rewrittenBullets.map((b) => `- ${b.improved}\n  Why: ${b.whyBetter}`),
      '',
      'Checklist:',
      ...resumeResult.actionChecklist.map((a) => `- ${a}`),
    ].join('\n');
    await saveCareerDoc({
      docType: 'resume-review',
      title: `Resume Refinement — ${targetRole}`,
      targetRole,
      content: md,
    });
    setResumeSavedMsg(true);
  };

  const handleDraftCoverLetter = async () => {
    setIsDraftingLetter(true);
    setLetterError(null);
    setLetterSavedMsg(false);
    try {
      const res = await fetch('/api/ai/career-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'cover-letter',
          companyName,
          targetRole: coverRole,
          background,
          keyProjects,
          tone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to draft cover letter.');
      setLetterResult(data);
    } catch (err) {
      setLetterError(err instanceof Error ? err.message : 'Unable to generate cover letter.');
    } finally {
      setIsDraftingLetter(false);
    }
  };

  const handleSaveCoverLetter = async () => {
    if (!letterResult) return;
    await saveCareerDoc({
      docType: 'cover-letter',
      title: `Cover Letter — ${companyName || coverRole}`,
      targetRole: coverRole,
      content: `Subject: ${letterResult.subjectLine}\n\n${letterResult.coverLetter}`,
    });
    setLetterSavedMsg(true);
  };

  const handleCopyLetter = async () => {
    if (!letterResult) return;
    try {
      await navigator.clipboard.writeText(
        `Subject: ${letterResult.subjectLine}\n\n${letterResult.coverLetter}`
      );
      setLetterCopied(true);
      setTimeout(() => setLetterCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const startOrContinueMock = async (candidateMessage?: string) => {
    setIsMockLoading(true);
    setMockError(null);
    const nextHistory = candidateMessage
      ? [...mockHistory, { role: 'candidate' as const, text: candidateMessage }]
      : [];
    if (candidateMessage) {
      setMockHistory(nextHistory);
      setMockInput('');
    }
    try {
      const res = await fetch('/api/ai/career-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'mock-interview',
          stack: mockStack,
          targetRole,
          history: nextHistory,
          candidateMessage: candidateMessage || 'Please start the mock interview with Question 1.',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Mock interviewer request failed.');

      const turn: MockTurn = {
        role: 'interviewer',
        text: data.nextQuestion,
        feedback: data.quickFeedback,
        hint: data.hintIfStuck,
      };
      setMockHistory((prev) => [...prev, turn]);
    } catch (err) {
      setMockError(err instanceof Error ? err.message : 'Unable to reach mock interviewer.');
    } finally {
      setIsMockLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              HR Behavioral Coach, Resume Studio & Interview Playbook
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Practice STAR behavioral rounds, refine ATS resume bullets, draft tailored cover letters, and rehearse live mock interviews.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto shrink-0">
            {(
              [
                ['behavioral', 'HR & Behavioral'],
                ['resume', 'Resume Refinement'],
                ['cover-letter', 'Cover Letter'],
                ['strategy', 'Mock Interview & Strategy'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSubTab(id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  subTab === id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SUBTAB 1: HR & Behavioral Coach */}
      {subTab === 'behavioral' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Select Behavioral Topic</h2>
            <div className="space-y-2">
              {BEHAVIORAL_PROMPTS.map((item) => {
                const active = item.id === selectedPromptId && !customQuestion.trim();
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedPromptId(item.id);
                      setCustomQuestion('');
                      setBehFeedback(null);
                      setShowSampleAnswer(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-md border transition-colors ${
                      active
                        ? 'bg-blue-50 border-blue-600 text-blue-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-900">{item.topic}</div>
                    <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.question}</div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <label htmlFor="custom-hr-q" className="block text-xs font-medium text-slate-700 mb-1.5">
                Or Practice a Custom HR / Project Question
              </label>
              <input
                id="custom-hr-q"
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g. Why should we hire you over other freshers?"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </section>

          <section className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-xs text-slate-500">
                  {customQuestion.trim() ? 'Custom Question' : activePrompt.topic} · STAR Practice
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                  {customQuestion.trim() || activePrompt.question}
                </h2>
              </div>

              {!customQuestion.trim() && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Coach Strategy Tip</div>
                  <p className="text-xs text-slate-600">{activePrompt.starTip}</p>
                  <button
                    type="button"
                    onClick={() => setShowSampleAnswer((s) => !s)}
                    className="text-xs font-medium text-blue-700 hover:text-blue-900"
                  >
                    {showSampleAnswer
                      ? 'Hide Sample Interview-Ready Answer'
                      : 'View Sample Interview-Ready Answer'}
                  </button>
                  {showSampleAnswer && (
                    <p className="text-xs text-slate-800 bg-white border border-slate-200 rounded p-3 leading-relaxed">
                      {activePrompt.sampleShortAnswer}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="behavioral-draft"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Your Practice Response
                </label>
                <textarea
                  id="behavioral-draft"
                  rows={6}
                  value={behavioralDraft}
                  onChange={(e) => setBehavioralDraft(e.target.value)}
                  placeholder="Write how you would answer this out loud in 30–60 seconds (include Situation, Task, your specific Action, and Result)..."
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white leading-relaxed"
                />
              </div>

              {behError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {behError}
                </p>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleEvaluateBehavioral}
                  disabled={isEvaluatingBeh}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-md"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{isEvaluatingBeh ? 'Reviewing Answer...' : 'Get AI Coach Feedback'}</span>
                </button>
              </div>
            </div>

            {behFeedback && (
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500">AI HR Coach Assessment</div>
                    <div className="text-base font-semibold text-slate-900">
                      Clarity & Impact Review
                    </div>
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums text-blue-700">
                    {behFeedback.clarityScore}/100
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <div className="font-semibold text-slate-800">Situation</div>
                    <div className="text-slate-600 mt-1">{behFeedback.starBreakdown.situation}</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <div className="font-semibold text-slate-800">Task</div>
                    <div className="text-slate-600 mt-1">{behFeedback.starBreakdown.task}</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <div className="font-semibold text-slate-800">Action</div>
                    <div className="text-slate-600 mt-1">{behFeedback.starBreakdown.action}</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <div className="font-semibold text-slate-800">Result</div>
                    <div className="text-slate-600 mt-1">{behFeedback.starBreakdown.result}</div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-md">
                  <div className="text-xs font-semibold text-emerald-900 mb-1">
                    Polished Interview-Ready Version
                  </div>
                  <p className="text-sm text-emerald-950 leading-relaxed">
                    {behFeedback.polishedAnswer}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">Strengths</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {behFeedback.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">Watch-Outs / Red Flags</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {behFeedback.redFlags.length > 0 ? (
                        behFeedback.redFlags.map((r, i) => <li key={i}>{r}</li>)
                      ) : (
                        <li>No major red flags detected.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Likely Follow-Up Question: </span>
                  {behFeedback.followUpQuestion}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* SUBTAB 2: Resume Refinement */}
      {subTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Paste Resume Summary or Project Bullets
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tailored to: {targetRole}
              </p>
            </div>
            <textarea
              rows={11}
              value={resumeInput}
              onChange={(e) => setResumeInput(e.target.value)}
              placeholder={`Example:\n- Built an e-commerce website using Spring Boot and React\n- Used MySQL database to store users and orders\n- Fixed bugs and deployed the app`}
              className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white leading-relaxed"
            />
            {resumeError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {resumeError}
              </p>
            )}
            <button
              type="button"
              onClick={handleRefineResume}
              disabled={isRefiningResume}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-md"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isRefiningResume ? 'Analyzing Resume...' : 'Analyze & Refine Bullets'}</span>
            </button>
          </section>

          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6">
            {!resumeResult ? (
              <div className="py-12 text-center">
                <div className="text-sm font-medium text-slate-900">
                  ATS Keyword & Bullet Impact Analyzer
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Paste your project bullets on the left to get concrete Action + Tech Stack + Quantifiable Impact rewrites and missing recruiter keywords.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
                  <div>
                    <div className="text-xs font-medium text-slate-500">Resume Review Summary</div>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {resumeResult.summaryVerdict}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveResumeReview}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md shrink-0"
                  >
                    {resumeSavedMsg ? (
                      <>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Save Review</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-800 mb-1.5">
                    Missing Stack & ATS Keywords to Include
                  </div>
                  <p className="text-xs text-slate-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                    {resumeResult.missingKeywords.join(' · ')}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-800">
                    Rewritten High-Impact Bullets
                  </div>
                  {resumeResult.rewrittenBullets.map((b, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                      <div className="text-xs text-slate-500 line-through">{b.original}</div>
                      <div className="text-sm font-medium text-slate-900">{b.improved}</div>
                      <div className="text-xs text-blue-800">Why it works: {b.whyBetter}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-800 mb-1.5">
                    Next Action Checklist
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                    {resumeResult.actionChecklist.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* SUBTAB 3: Cover Letter Studio */}
      {subTab === 'cover-letter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Cover Letter Inputs</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Company
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme FinTech"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  value={coverRole}
                  onChange={(e) => setCoverRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Academic / Fresher Background
                </label>
                <input
                  type="text"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Key Projects & Technical Stack
                </label>
                <textarea
                  rows={4}
                  value={keyProjects}
                  onChange={(e) => setKeyProjects(e.target.value)}
                  placeholder="e.g. Built an Order Management REST API in Spring Boot + PostgreSQL with JWT auth and React dashboard; solved N+1 query bottleneck."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md"
                >
                  <option value="Confident, concise, engineering-focused">
                    Confident & Engineering-Focused
                  </option>
                  <option value="Warm, eager to learn, startup-friendly">
                    Startup-Friendly & Curious
                  </option>
                  <option value="Formal enterprise graduate application">
                    Formal Enterprise Graduate
                  </option>
                </select>
              </div>
            </div>

            {letterError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {letterError}
              </p>
            )}

            <button
              type="button"
              onClick={handleDraftCoverLetter}
              disabled={isDraftingLetter}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-md"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isDraftingLetter ? 'Drafting Letter...' : 'Draft Tailored Cover Letter'}</span>
            </button>
          </section>

          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6">
            {!letterResult ? (
              <div className="py-14 text-center">
                <div className="text-sm font-medium text-slate-900">
                  Fresher Cover Letter Generator
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Describe one or two projects on the left to generate a concise, non-generic engineering cover letter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="text-xs font-medium text-slate-600">
                    Subject: <span className="text-slate-900 font-semibold">{letterResult.subjectLine}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLetter}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md"
                    >
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{letterCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCoverLetter}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md"
                    >
                      <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{letterSavedMsg ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>
                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {letterResult.coverLetter}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* SUBTAB 4: Mock Interview Strategies & Live AI Mock Interviewer */}
      {subTab === 'strategy' && (
        <div className="space-y-6">
          {/* Live AI Mock Interview Simulator */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Live AI Mock Interview Session
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Practice one-on-one verbal/written technical or project-defense rounds with instant turn-by-turn feedback.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Mock interview focus track"
                  value={mockStack}
                  onChange={(e) => setMockStack(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                >
                  <option value="Core Java, OOP & Collections">Core Java</option>
                  <option value="SQL, Joins, Normalization & Transactions">SQL & DBMS</option>
                  <option value="Data Structures & Algorithms">DSA</option>
                  <option value="Spring Boot, REST APIs & Hibernate">Spring Boot & Backend</option>
                  <option value="HTML, CSS, JavaScript & React">Frontend & React</option>
                  <option value="Project Architecture, Database & Debugging">Project Deep Dive</option>
                  <option value="HR & Behavioral (STAR)">HR & Behavioral</option>
                </select>
                <button
                  type="button"
                  onClick={() => startOrContinueMock()}
                  disabled={isMockLoading}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md whitespace-nowrap"
                >
                  {mockHistory.length === 0 ? 'Start Mock Round' : 'Restart Round'}
                </button>
              </div>
            </div>

            {mockError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {mockError}
              </p>
            )}

            {mockHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Choose a focus track above and click <span className="font-semibold text-slate-800">Start Mock Round</span> to begin Question 1.
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {mockHistory.map((turn, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-md border ${
                      turn.role === 'interviewer'
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">
                      {turn.role === 'interviewer' ? 'Interviewer' : 'Your Response'}
                    </div>
                    {turn.feedback && (
                      <p className="text-xs text-slate-600 mb-2 pb-2 border-b border-slate-200">
                        <span className="font-semibold text-slate-800">Feedback: </span>
                        {turn.feedback}
                      </p>
                    )}
                    <p className="text-sm text-slate-900 leading-relaxed">{turn.text}</p>
                    {turn.hint && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setShowMockHintIdx(showMockHintIdx === idx ? null : idx)
                          }
                          className="text-xs text-blue-700 hover:text-blue-900 font-medium"
                        >
                          {showMockHintIdx === idx ? 'Hide Hint' : 'Stuck? Show Hint'}
                        </button>
                        {showMockHintIdx === idx && (
                          <p className="text-xs text-slate-600 mt-1">{turn.hint}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {mockHistory.length > 0 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!mockInput.trim() || isMockLoading) return;
                  startOrContinueMock(mockInput.trim());
                }}
                className="flex items-center gap-2 pt-2"
              >
                <input
                  type="text"
                  value={mockInput}
                  onChange={(e) => setMockInput(e.target.value)}
                  placeholder="Type your interview answer..."
                  className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={isMockLoading || !mockInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{isMockLoading ? 'Thinking...' : 'Send Answer'}</span>
                </button>
              </form>
            )}
          </section>

          {/* Round-by-Round Playbook */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Fresher Mock Interview Strategy Playbook
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTERVIEW_PLAYBOOK.map((stage) => (
                <div
                  key={stage.round}
                  className="bg-white border border-slate-200 rounded-lg p-5 space-y-3"
                >
                  <div>
                    <div className="text-xs font-mono text-blue-700 font-semibold">
                      {stage.round}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">{stage.focus}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 mb-1">
                      What Interviewers Evaluate
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                      {stage.whatInterviewersCheck.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-xs font-semibold text-slate-800 mb-1">
                      Action Checklist
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                      {stage.checklist.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Saved Career Documents Vault */}
      {careerDocs.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Saved Resume Reviews & Cover Letters
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {careerDocs.length} saved
            </span>
          </div>
          <div className="divide-y divide-slate-200">
            {careerDocs.map((docItem) => (
              <div key={docItem.id} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">{docItem.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {docItem.docType.replace('-', ' ')} · {docItem.targetRole} ·{' '}
                    {new Date(docItem.updatedAtMs).toLocaleDateString()}
                  </div>
                  <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">
                    {docItem.content}
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCareerDoc(docItem.id)}
                  aria-label={`Delete ${docItem.title}`}
                  className="p-2 text-slate-400 hover:text-red-700 rounded-md shrink-0"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
