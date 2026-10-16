"use client";

import React, { useState } from "react";
import { Mail, Copy, Check, Download } from "lucide-react";
import { downloadPlainText } from "../lib/api";

interface CoverLetterViewProps {
  coverLetterText?: string;
  candidateName: string;
}

export const CoverLetterView: React.FC<CoverLetterViewProps> = ({
  coverLetterText,
  candidateName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!coverLetterText) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 text-center text-slate-500 dark:text-slate-400 shadow-sm">
        <Mail className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
        <p className="text-sm font-medium">Cover letter generation was not enabled for this run.</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Enable the &quot;Generate Matching Cover Letter&quot; switch in the preferences panel and re-run.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadPlainText(coverLetterText, `${candidateName.replace(/\s+/g, "_")}_Cover_Letter.txt`);
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Role-Tailored Cover Letter</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 text-xs font-medium transition shadow-sm"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Copy Letter"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Letter Container (Always White Paper) */}
      <div className="rounded-2xl border border-slate-200 bg-white text-slate-800 p-8 sm:p-10 shadow-xl whitespace-pre-line leading-relaxed text-xs sm:text-[13px] font-normal font-sans">
        {coverLetterText}
      </div>
    </div>
  );
};
