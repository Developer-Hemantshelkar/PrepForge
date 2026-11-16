'use client';

import React, { useMemo, useState } from 'react';
import { CONCEPTS, ConceptItem } from '@/data/concepts';
import { STACKS, getStackLabel, StackId } from '@/data/stacks';
import { usePrep } from '@/context/PrepContext';
import { Check, ChevronDown, ChevronUp, Copy, Search } from 'lucide-react';

export function StudyHub() {
  const { selectedStacks, masteredConcepts, toggleMasteredConcept } = usePrep();

  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [masteryFilter, setMasteryFilter] = useState<'all' | 'pending' | 'mastered'>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeStacks: StackId[] = useMemo(
    () => (selectedStacks.length > 0 ? selectedStacks : STACKS.map((s) => s.id)),
    [selectedStacks]
  );

  const stackFilteredConcepts = useMemo(
    () => CONCEPTS.filter((c) => activeStacks.includes(c.stack)),
    [activeStacks]
  );

  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    stackFilteredConcepts.forEach((c) => set.add(c.topic));
    return Array.from(set);
  }, [stackFilteredConcepts]);

  const filteredConcepts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stackFilteredConcepts.filter((c) => {
      if (topicFilter !== 'all' && c.topic !== topicFilter) return false;
      const isMastered = masteredConcepts.includes(c.id);
      if (masteryFilter === 'mastered' && !isMastered) return false;
      if (masteryFilter === 'pending' && isMastered) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        c.interviewReadyAnswer.toLowerCase().includes(q) ||
        c.keyPoints.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [stackFilteredConcepts, topicFilter, masteryFilter, searchQuery, masteredConcepts]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyAnswer = async (concept: ConceptItem) => {
    try {
      await navigator.clipboard.writeText(concept.interviewReadyAnswer);
      setCopiedId(concept.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Fallback ignored if clipboard unavailable
    }
  };

  const masteredInView = stackFilteredConcepts.filter((c) =>
    masteredConcepts.includes(c.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Study Controls Bar */}
      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Concept Library & Interview-Ready Short Answers
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Every topic includes a concise, spoken-ready interview short answer plus follow-up traps and code examples.
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 self-start lg:self-auto">
            {masteredInView} / {stackFilteredConcepts.length} concepts marked interview-ready
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search HashMap, joins, ACID, Spring DI, React hooks, education gap..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <select
            aria-label="Filter by subtopic"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Subtopics ({availableTopics.length})</option>
            {availableTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {(['all', 'pending', 'mastered'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setMasteryFilter(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  masteryFilter === mode
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'all' ? 'All' : mode === 'pending' ? 'To Review' : 'Interview-Ready'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Concept Cards List */}
      {filteredConcepts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <div className="text-sm font-medium text-slate-900">
            No matching concepts for the current filters
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Try clearing the search query or selecting All Subtopics.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setTopicFilter('all');
              setMasteryFilter('all');
            }}
            className="mt-4 px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800"
          >
            Reset Study Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConcepts.map((concept) => {
            const isMastered = masteredConcepts.includes(concept.id);
            const isExpanded = !!expandedIds[concept.id];

            return (
              <article
                key={concept.id}
                className="bg-white border border-slate-200 rounded-lg p-6 transition-colors"
              >
                {/* Clean 1-line unboxed metadata + action header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{getStackLabel(concept.stack)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{concept.topic}</span>
                      <span aria-hidden="true">·</span>
                      <span>{concept.difficulty}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mt-1">
                      {concept.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleMasteredConcept(concept.id)}
                    aria-pressed={isMastered}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 self-start ${
                      isMastered
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isMastered ? 'Interview-Ready' : 'Mark Ready'}</span>
                  </button>
                </div>

                {/* Mandatory Interview-Ready Short Answer */}
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-md p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-blue-800">
                      Interview-Ready Short Answer
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAnswer(concept)}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                    >
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{copiedId === concept.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed max-w-[75ch]">
                    {concept.interviewReadyAnswer}
                  </p>
                </div>

                {/* Expandable Deep Dive */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(concept.id)}
                    aria-expanded={isExpanded}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 py-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" aria-hidden="true" />
                        <span>Hide Follow-Up Points & Pitfalls</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                        <span>Show Key Follow-Up Points, Code & Common Pitfall</span>
                      </>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pt-4 border-t border-slate-200 space-y-4">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-700 mb-2">
                          Key Follow-Up Points
                        </h3>
                        <ul className="space-y-1.5 text-sm text-slate-700 list-disc pl-5">
                          {concept.keyPoints.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>

                      {concept.codeExample && (
                        <div>
                          <div className="text-xs font-semibold text-slate-700 mb-1.5">
                            Code Snippet ({concept.codeExample.language})
                          </div>
                          <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-md text-xs font-mono overflow-x-auto leading-relaxed">
                            <code>{concept.codeExample.snippet}</code>
                          </pre>
                        </div>
                      )}

                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="text-xs font-semibold text-amber-900">
                          Common Fresher Pitfall
                        </div>
                        <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                          {concept.commonMistake}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
