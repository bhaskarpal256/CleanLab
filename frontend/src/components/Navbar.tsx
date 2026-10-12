"use client";

import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";

interface NavbarProps {
  backendStatus: { online: boolean; llm_engine?: string };
  onLoadDemo: () => void;
  onReset: () => void;
  isCustomizing: boolean;
  onOpenHfModal: () => void;
  hasHfToken: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendStatus,
  onLoadDemo,
  onReset,
  isCustomizing,
  onOpenHfModal,
  hasHfToken,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#090d16]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">
                PrepLab <span className="text-indigo-400">ResumeAI</span>
              </span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Intelligent Resume Customizer & ATS Match Engine
            </p>
          </div>
        </div>

        {/* Backend & Model Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 rounded-full bg-slate-900/80 px-3 py-1.5 border border-slate-800 text-xs">
            {backendStatus.online ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300">
                  Engine: <span className="text-emerald-400 font-medium">{backendStatus.llm_engine || "Gemini AI"}</span>
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="text-amber-300">Connecting Backend...</span>
              </>
            )}
          </div>

          {/* Hugging Face Settings Button */}
          <button
            onClick={onOpenHfModal}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
              hasHfToken
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
            title="Configure Hugging Face API key and model"
          >
            <span>🤗</span>
            <span className="hidden sm:inline">Hugging Face</span>
            {hasHfToken && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          {/* Quick Demo Button */}
          <button
            onClick={onLoadDemo}
            disabled={isCustomizing}
            className="group relative inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30 transition hover:border-indigo-400 hover:text-white hover:shadow-sm disabled:opacity-50"
            title="Load the ThePrepLab Full-Stack Developer JD and candidate resume"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span>Load Demo Case</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            disabled={isCustomizing}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition disabled:opacity-50"
            title="Clear all fields"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
