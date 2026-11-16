'use client';

import React from 'react';
import { STACKS, STACK_PRESETS, StackId } from '@/data/stacks';
import { usePrep } from '@/context/PrepContext';
import { RotateCcw } from 'lucide-react';

export function StackFilterBar() {
  const {
    selectedStacks,
    toggleStackFilter,
    setSelectedStacks,
    applyPreset,
    targetRole,
  } = usePrep();

  const isAllSelected = selectedStacks.length === 0;

  return (
    <section
      aria-label="Target tech stack filter"
      className="bg-white border border-slate-200 rounded-lg p-4 mb-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-medium text-slate-500">
            Target Preparation Profile · {targetRole}
          </div>
          <h2 className="text-sm font-semibold text-slate-900 mt-0.5">
            Filter Study Concepts, Quizzes, Code Challenges & Tests by Tech Stack
          </h2>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {STACK_PRESETS.map((preset) => {
            const matches =
              preset.stacks.length === selectedStacks.length &&
              preset.stacks.every((s) => selectedStacks.includes(s));
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  matches
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center flex-wrap gap-1.5">
          {STACKS.map((stack) => {
            const active = selectedStacks.includes(stack.id);
            return (
              <button
                key={stack.id}
                type="button"
                onClick={() => toggleStackFilter(stack.id as StackId)}
                aria-pressed={active}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  active
                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {stack.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
          <span className="font-mono tabular-nums">
            {isAllSelected
              ? '7 / 7 stacks active'
              : `${selectedStacks.length} / 7 stacks selected`}
          </span>
          {!isAllSelected && (
            <button
              type="button"
              onClick={() => setSelectedStacks([])}
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Show all
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
