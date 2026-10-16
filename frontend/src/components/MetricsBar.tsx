"use client";

import React from "react";
import { ArrowUpRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { TailoredResumeResponse } from "../types/resume";

interface MetricsBarProps {
  data: TailoredResumeResponse;
  onOpenATSModal?: () => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ data, onOpenATSModal }) => {
  const matchGain = Math.max(0, data.match_score_after - data.match_score_before);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* 1. Job Fit Score (Hero Card) */}
      <div className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Role Match</span>
          {matchGain > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[11px] font-bold border border-emerald-500/20">
              <ArrowUpRight className="h-3 w-3" />
              +{matchGain}%
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data.match_score_after}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            (was {data.match_score_before}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${data.match_score_after}%` }}
          />
        </div>
      </div>

      {/* 2. ATS Readiness */}
      <div
        onClick={onOpenATSModal}
        className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500/50 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            ATS Readiness
          </span>
          <ShieldCheck className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.ats_score}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">/ 100</span>
          <span className="ml-auto text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {data.ats_score >= 85 ? "Clean Format" : "Good Format"}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              data.ats_score >= 80 ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${data.ats_score}%` }}
          />
        </div>
      </div>

      {/* 3. Core Skills Aligned */}
      <div className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Key Skills Aligned</span>
          <span className="inline-flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {data.missing_keywords.length === 0 ? "Full match" : `${data.missing_keywords.length} missing`}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data.matched_keywords.length}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            skills matched
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-700"
            style={{
              width: `${
                data.matched_keywords.length + data.missing_keywords.length > 0
                  ? Math.round(
                      (data.matched_keywords.length /
                        (data.matched_keywords.length + data.missing_keywords.length)) *
                        100
                    )
                  : 85
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
