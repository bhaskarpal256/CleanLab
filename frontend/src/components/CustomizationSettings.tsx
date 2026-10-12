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
    desc: "Google XYZ format with quantified % gains and results",
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
    desc: "Harmonious balance of keywords, clarity, and ATS readability",
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex items-center space-x-2 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
          3
        </span>
        <h2 className="text-base font-semibold text-white">Customization Preferences</h2>
      </div>

      {/* Tone Selection */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Optimization Strategy & Tone</span>
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
                className={`flex flex-col text-left p-2.5 rounded-xl border text-xs transition ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/10 text-white shadow-sm ring-1 ring-indigo-500/30"
                    : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <span>{t.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 leading-snug">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section-Wise Toggles */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-indigo-400" />
          <span>Sections to Re-align</span>
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
                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-200"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${isChecked ? "bg-indigo-400" : "bg-slate-600"}`}></span>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bonus Feature: Cover Letter Toggle */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-200 block">Generate Matching Cover Letter</span>
          <span className="text-[11px] text-slate-400">Creates a role-tailored pitch letter addressed to the hiring team</span>
        </div>
        <button
          type="button"
          onClick={() => setOptions((prev) => ({ ...prev, generate_cover_letter: !prev.generate_cover_letter }))}
          disabled={isProcessing}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            options.generate_cover_letter ? "bg-indigo-600" : "bg-slate-800"
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
