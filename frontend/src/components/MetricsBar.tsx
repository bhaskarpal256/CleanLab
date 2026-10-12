"use client";

import React from "react";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import { TailoredResumeResponse } from "../types/resume";

interface MetricsBarProps {
  data: TailoredResumeResponse;
  onOpenATSModal?: () => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ data, onOpenATSModal }) => {
  const matchGain = Math.max(0, data.match_score_after - data.match_score_before);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/30 to-slate-900/90 border border-indigo-500/20 backdrop-blur-md">
      {/* 1. Match Score Before */}
      <div className="flex flex-col p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <span className="text-[11px] font-medium text-slate-400">Original JD Match</span>
        <div className="flex items-baseline space-x-1.5 mt-1">
          <span className="text-2xl font-bold text-slate-300">{data.match_score_before}%</span>
          <span className="text-[10px] text-slate-500">before tailoring</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-slate-400 h-full rounded-full transition-all duration-1000"
            style={{ width: `${data.match_score_before}%` }}
          />
        </div>
      </div>

      {/* 2. Tailored Match Score (Hero) */}
      <div className="flex flex-col p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 shadow-sm relative overflow-hidden">
        <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
          <ArrowUpRight className="h-3 w-3" />
          <span>+{matchGain}%</span>
        </div>
        <span className="text-[11px] font-medium text-indigo-300">Tailored Match Score</span>
        <div className="flex items-baseline space-x-1 mt-1">
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300">
            {data.match_score_after}%
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">High Fit</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-indigo-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${data.match_score_after}%` }}
          />
        </div>
      </div>

      {/* 3. ATS Optimization Score */}
      <div
        onClick={onOpenATSModal}
        className="flex flex-col p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-indigo-500/40 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 group-hover:text-indigo-300 transition">
            ATS Friendliness
          </span>
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
        </div>
        <div className="flex items-baseline space-x-1.5 mt-1">
          <span className="text-2xl font-bold text-white">{data.ats_score}</span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              data.ats_score >= 80 ? "bg-emerald-400" : data.ats_score >= 60 ? "bg-amber-400" : "bg-rose-400"
            }`}
            style={{ width: `${data.ats_score}%` }}
          />
        </div>
      </div>

      {/* 4. Keyword Alignment Counter */}
      <div className="flex flex-col p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <span className="text-[11px] font-medium text-slate-400">Keywords Aligned</span>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-2xl font-bold text-white">{data.matched_keywords.length}</span>
          <span className="text-[11px] text-slate-400">
            matched ({data.missing_keywords.length} missing)
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-[10px]">
          <span className="inline-flex items-center text-emerald-400">
            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Strong Alignment
          </span>
        </div>
      </div>
    </div>
  );
};
