"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Lightbulb, Tag, Check } from "lucide-react";
import { TailoredResumeResponse } from "../types/resume";

interface ATSAnalysisTabProps {
  data: TailoredResumeResponse;
}

export const ATSAnalysisTab: React.FC<ATSAnalysisTabProps> = ({ data }) => {
  const evalData = data.ats_evaluation;

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* ATS Score card */}
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Overall ATS Score</span>
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{data.ats_score}</span>
            <span className="text-sm font-semibold text-emerald-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Calculated across keyword density, format compatibility, active verbs, and quantifiable metrics.
          </p>
        </div>

        {/* Quantifiable Metrics Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400">Measurable Impact</span>
          <div className="my-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{evalData.quantifiable_metrics_score}%</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Presence of percentage improvements, user counts, and latency reduction metrics in bullet points.
          </p>
        </div>

        {/* Action Verbs Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400">Strong Action Verbs</span>
          <div className="my-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{evalData.action_verbs_score}%</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Front-loaded active leadership verbs (Architected, Engineered, Spearheaded, Optimized).
          </p>
        </div>
      </div>

      {/* ATS Compliance Checklist */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <span>ATS Screening Breakdown & Checks</span>
        </h3>

        <div className="space-y-3">
          {evalData.checklist.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
            >
              <div className="flex items-start space-x-3">
                {item.status === "pass" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : item.status === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-semibold text-white">{item.category}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{item.message}</p>
                </div>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                  item.status === "pass"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : item.status === "warning"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Matched Keywords vs Missing Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Keywords */}
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              <span>Matched Keywords ({data.matched_keywords.length})</span>
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.matched_keywords.map((kw, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Keywords (Opportunity to Add) */}
        <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Recommended Additions ({data.missing_keywords.length})</span>
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5">
            Key terms found in the JD that you can incorporate into your project or skills section:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.missing_keywords.map((kw, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-300"
              >
                + {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Advice */}
      {evalData.actionable_advice.length > 0 && (
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2.5 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <span>Recruiter & ATS Optimization Tips</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {evalData.actionable_advice.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
