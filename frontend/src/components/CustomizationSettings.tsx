"use client";

import React from "react";
import { Sparkles, Check, Layers } from "lucide-react";
import { CustomizationOptions } from "../types/resume";

interface CustomizationSettingsProps {
  options: CustomizationOptions;
  setOptions: React.Dispatch<React.SetStateAction<CustomizationOptions>>;
  isProcessing: boolean;
}

const TONES: { id: "impact_metrics" | "balanced" | "technical" | "executive"; label: string; desc: string }[] = [
  {
    id: "impact_metrics",
    label: "Impact & Metrics",
    desc: "Metrics-driven achievements with quantifiable business outcomes",
  },
  {
    id: "technical",
    label: "Technical Specialist",
    desc: "Highlights architecture, frameworks, and system design",
  },
  {
    id: "executive",
    label: "Executive & Ownership",
    desc: "Focuses on strategic delivery, leadership, and cross-functional ownership",
  },
  {
    id: "balanced",
    label: "Standard ATS",
    desc: "Clear balance of core keywords, brevity, and ATS readability",
  },
];

const SECTIONS = [
  { id: "summary", label: "Executive Summary" },
  { id: "skills", label: "Skills Categorization" },
  { id: "experience", label: "Experience Bullets" },
  { id: "projects", label: "Key Projects" },
];

export const CustomizationSettings: React.FC<CustomizationSettingsProps> = ({
  options,
  setOptions,
  isProcessing,
}) => {
  const toggleSection = (sectionId: string) => {
    setOptions((prev) => {
      const exists = prev.sections_to_customize.includes(sectionId);
      if (exists) {
        if (prev.sections_to_customize.length === 1) return prev; // Keep at least one
        return {
          ...prev,
          sections_to_customize: prev.sections_to_customize.filter((s) => s !== sectionId),
        };
      } else {
        return {
          ...prev,
          sections_to_customize: [...prev.sections_to_customize, sectionId],
        };
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-sm shadow-sm transition-colors duration-200">
      <div className="flex items-center space-x-2 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
          3
        </span>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Customization Preferences</h2>
      </div>

      {/* Editable Criteria: Target Role & Target Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Target Role / Title
          </label>
          <input
            type="text"
            value={options.target_role || ""}
            onChange={(e) => setOptions((prev) => ({ ...prev, target_role: e.target.value }))}
            placeholder="e.g. Full-Stack Developer (AI & Mobile)"
            disabled={isProcessing}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 p-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Target Company / Hiring Org
          </label>
          <input
            type="text"
            value={options.target_company || ""}
            onChange={(e) => setOptions((prev) => ({ ...prev, target_company: e.target.value }))}
            placeholder="e.g. ThePrepLab / Innovista Labs"
            disabled={isProcessing}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 p-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Editable Criteria: Seniority Level & Key Skills to Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Target Seniority / Career Level
          </label>
          <select
            value={options.seniority_level || "Mid-Level (2-5 years)"}
            onChange={(e) => setOptions((prev) => ({ ...prev, seniority_level: e.target.value }))}
            disabled={isProcessing}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 p-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Entry-Level (<2 years)">Entry-Level (&lt;2 years)</option>
            <option value="Mid-Level (2-5 years)">Mid-Level (2-5 years)</option>
            <option value="Senior Engineer (5-8 years)">Senior Engineer (5-8 years)</option>
            <option value="Staff / Lead Architect (8+ years)">Staff / Lead Architect (8+ years)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Key Tech Stack to Prioritize
          </label>
          <input
            type="text"
            value={options.key_skills_to_emphasize || ""}
            onChange={(e) => setOptions((prev) => ({ ...prev, key_skills_to_emphasize: e.target.value }))}
            placeholder="e.g. PostgreSQL, Azure, Next.js, Docker, FastAPI"
            disabled={isProcessing}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 p-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Editable Criteria: Custom Instructions & Focus Areas */}
      <div className="mb-4">
        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
          Special Focus or Additional Context
        </label>
        <textarea
          rows={2}
          value={options.custom_instructions || ""}
          onChange={(e) => setOptions((prev) => ({ ...prev, custom_instructions: e.target.value }))}
          placeholder="e.g. Emphasize Azure and PostgreSQL experience; highlight mobile app on Play Store..."
          disabled={isProcessing}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
        />
      </div>

      {/* Tone Selection */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-800 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Tailoring Focus & Tone</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {TONES.map((t) => {
            const isSelected = options.tone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setOptions((prev) => ({ ...prev, tone: t.id }))}
                disabled={isProcessing}
                className={`flex flex-col justify-between text-left p-2.5 rounded-xl border text-xs transition h-full ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-white shadow-sm ring-1 ring-indigo-400/30 dark:ring-indigo-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between font-medium w-full">
                  <span>{t.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section-Wise Toggles */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-800 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Sections to Tailor</span>
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {SECTIONS.map((sec) => {
            const isChecked = options.sections_to_customize.includes(sec.id);
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => toggleSection(sec.id)}
                disabled={isProcessing}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  isChecked
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-600/20 dark:border-indigo-500/40 dark:text-indigo-200"
                    : "bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${isChecked ? "bg-indigo-500 dark:bg-indigo-400" : "bg-slate-400 dark:bg-slate-600"}`}></span>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bonus Feature: Cover Letter Toggle */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">Generate Matching Cover Letter</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Creates a role-tailored pitch letter addressed to the hiring team</span>
        </div>
        <button
          type="button"
          onClick={() => setOptions((prev) => ({ ...prev, generate_cover_letter: !prev.generate_cover_letter }))}
          disabled={isProcessing}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            options.generate_cover_letter ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-800"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              options.generate_cover_letter ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
};
