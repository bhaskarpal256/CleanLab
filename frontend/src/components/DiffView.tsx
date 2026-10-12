"use client";

import React from "react";
import { GitCompare, ArrowRight, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { TailoredResumeResponse } from "../types/resume";

interface DiffViewProps {
  data: TailoredResumeResponse;
}

export const DiffView: React.FC<DiffViewProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* 1. High Level Changes Summary Card */}
      {data.diff_summary && data.diff_summary.length > 0 && (
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/20 p-5 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-3">
            <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Optimization Highlights & AI Rationale</h3>
          </div>
          <ul className="space-y-2">
            {data.diff_summary.map((change, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. Professional Summary Diff */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
          <GitCompare className="h-3.5 w-3.5" />
          <span>Professional Summary Evolution</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                Original Summary
              </span>
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300">
                Before
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              {data.original_summary || "Generic summary prior to role-specific JD alignment."}
            </p>
          </div>

          {/* After */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Tailored AI Summary
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 font-semibold">
                Optimized
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              {data.summary}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Experience Bullet Transformations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Experience Bullet Transformations</span>
        </h3>

        <div className="space-y-6">
          {data.experience.map((job, idx) => (
            <div key={idx} className="border-t border-slate-800/80 pt-4 first:border-0 first:pt-0">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-sm font-bold text-white">
                  {job.role} <span className="text-slate-400 font-normal">at {job.company}</span>
                </span>
                <span className="text-xs text-slate-500">{job.duration}</span>
              </div>

              {job.key_changes && job.key_changes.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {job.key_changes.map((reason, rIdx) => (
                    <span
                      key={rIdx}
                      className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300"
                    >
                      💡 {reason}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Original Bullets */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Original Bullets
                  </span>
                  <ul className="space-y-2 text-xs text-slate-400">
                    {(job.original_bullets.length > 0 ? job.original_bullets : ["Standard bullet points."]).map(
                      (b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0 mt-0.5">-</span>
                          <span className="line-through decoration-slate-600 leading-relaxed">{b}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Tailored Bullets */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                    Tailored Impact Bullets
                  </span>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {job.tailored_bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
