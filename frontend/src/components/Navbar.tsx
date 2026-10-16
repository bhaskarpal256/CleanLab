"use client";

import React from "react";
import { Sparkles, RefreshCw, Sun, Moon } from "lucide-react";

interface NavbarProps {
  backendStatus: { online: boolean; llm_engine?: string };
  onReset: () => void;
  isCustomizing: boolean;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendStatus,
  onReset,
  isCustomizing,
  theme = "dark",
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#090d16]/85 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                CleanLab <span className="text-indigo-600 dark:text-indigo-400 font-medium">Resume</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Role-focused resume tailoring & ATS optimization
            </p>
          </div>
        </div>

        {/* Status & Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden md:flex items-center space-x-2 rounded-full bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 border border-slate-200 dark:border-slate-800 text-xs">
            {backendStatus.online ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {backendStatus.llm_engine ? `${backendStatus.llm_engine} ready` : "Ready"}
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="text-amber-600 dark:text-amber-300 text-[11px]">Connecting...</span>
              </>
            )}
          </div>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 transition"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          )}

          {/* Reset Button */}
          <button
            onClick={onReset}
            disabled={isCustomizing}
            className="inline-flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition disabled:opacity-50"
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
