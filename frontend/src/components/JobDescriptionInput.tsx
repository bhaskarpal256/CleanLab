"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface JobDescriptionInputProps {
  jobDescription: string;
  setJobDescription: (text: string) => void;
  onDetectRoleAndCompany?: (role: string, company: string) => void;
  isProcessing: boolean;
}

const PRESET_ROLES = [
  {
    title: "Full-Stack (AI & Mobile)",
    description: `Role: Full-Stack Developer — AI & Mobile Apps
Company: ThePrepLab (Innovista Labs)
Location: Gurugram, Haryana (Hybrid)

Responsibilities:
- Build responsive, accessible web applications with Next.js (React App Router), TypeScript, and Tailwind CSS.
- Design resilient REST APIs and microservices using Python (FastAPI / Flask).
- Integrate LLM workflows (Gemini, OpenAI, Groq) with prompt engineering and structured JSON outputs.
- Build and maintain cross-platform mobile applications (React Native / Flutter) and offline-first capabilities.
- Manage PostgreSQL databases, Supabase, Azure cloud infrastructure, and Dockerized CI/CD pipelines.

Requirements:
- 2+ years experience in full-stack web and mobile application engineering.
- Deep expertise in Next.js, Python FastAPI, PostgreSQL, Supabase, Azure, and LLM APIs.
- Proven ownership of shipping production products end-to-end.`,
  },
  {
    title: "Senior AI Engineer",
    description: `Role: Senior AI & LLM Engineer
Company: Innovista AI Labs

Key Responsibilities:
- Design and deploy production generative AI applications utilizing Gemini, Claude, and OpenAI APIs.
- Build retrieval-augmented generation (RAG) pipelines with vector search (Pinecone / pgvector).
- Optimize backend API latency using Python FastAPI, async processing, and Redis caching.
- Build clean evaluation benchmarks, hallucination guards, and token usage monitors.
- Partner with product and frontend engineering to deliver streaming UI experiences in Next.js.`,
  },
  {
    title: "Frontend Architect",
    description: `Role: Lead Frontend Engineer
Company: TechVentures

Responsibilities:
- Architect enterprise Next.js and React applications with modern design systems and micro-frontends.
- Optimize web vitals (LCP, CLS, FID) to achieve 95+ performance scores.
- Collaborate with designers to build accessible (WCAG AA), responsive interfaces.
- Write robust end-to-end tests using Playwright and Vitest.`,
  },
];

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  jobDescription,
  setJobDescription,
  onDetectRoleAndCompany,
  isProcessing,
}) => {
  const charCount = jobDescription.length;
  const wordCount = jobDescription.split(/\s+/).filter(Boolean).length;
  const isValidLength = charCount >= 30;

  const handleTextChange = (newText: string) => {
    setJobDescription(newText);
    if (onDetectRoleAndCompany) {
      const roleMatch = newText.match(/(?:^|\n)\s*(?:Role|Job\s*Title|Position|Title)\s*:\s*([^\n\r]+)/i);
      const compMatch = newText.match(/(?:^|\n)\s*(?:Company|Organization|Employer|At)\s*:\s*([^\n\r]+)/i);
      if (roleMatch || compMatch) {
        onDetectRoleAndCompany(
          roleMatch ? roleMatch[1].trim() : "",
          compMatch ? compMatch[1].trim() : ""
        );
      }
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-sm shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            2
          </span>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Target Job Description</h2>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {isValidLength ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Valid ({wordCount} words)</span>
            </span>
          ) : charCount > 0 ? (
            <span className="text-amber-600 dark:text-amber-400">Min 30 chars required</span>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
        Paste the job requirements, responsibilities, or role description to match against.
      </p>

      {/* Quick Fill Preset Pills */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
          <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" /> Presets:
        </span>
        {PRESET_ROLES.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleTextChange(preset.description)}
            disabled={isProcessing}
            className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:hover:text-white dark:border-slate-700/80 px-2.5 py-1 text-[11px] font-medium transition"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div>
        <textarea
          value={jobDescription}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={6}
          disabled={isProcessing}
          placeholder="Paste Job Description here (e.g. 'We are looking for a Full-Stack Developer with experience in Next.js, Python, and AI integration...')"
          className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950/80 p-3.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 resize-y transition ${
            charCount > 0 && !isValidLength
              ? "border-amber-400 dark:border-amber-500/50 focus:border-amber-500 focus:ring-amber-500"
              : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
          }`}
        />
        
        {/* Clean Footer Bar with Word and Character Counts */}
        <div className="mt-1.5 flex items-center justify-between text-[11px] px-1 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            {isValidLength ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Ready for matching ({wordCount} words)
              </span>
            ) : charCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400">Min 30 chars required ({30 - charCount} needed)</span>
            ) : (
              <span className="text-slate-500 dark:text-slate-500">Paste text or select a role preset above</span>
            )}
          </span>
          <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
            {charCount} chars
          </span>
        </div>
      </div>
    </div>
  );
};
