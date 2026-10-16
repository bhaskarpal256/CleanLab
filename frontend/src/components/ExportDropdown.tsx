"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, FileDown, FileText, Printer, Copy, Check, ChevronDown } from "lucide-react";
import { TailoredResumeResponse } from "../types/resume";
import { downloadDocxFile, downloadPlainText } from "../lib/api";

interface ExportDropdownProps {
  data: TailoredResumeResponse;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrintPdf = () => {
    setIsOpen(false);
    window.print();
  };

  const handleDownloadDocx = async () => {
    setIsOpen(false);
    try {
      setDownloadingDocx(true);
      const safeName = (data.candidate_name || "Tailored_Resume").replace(/\s+/g, "_");
      await downloadDocxFile(data, `${safeName}_Customized.docx`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred";
      alert("Failed to download DOCX: " + message);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleDownloadMarkdown = () => {
    setIsOpen(false);
    const safeName = (data.candidate_name || "Tailored_Resume").replace(/\s+/g, "_");
    downloadPlainText(data.raw_markdown, `${safeName}_Tailored.md`);
  };

  const handleDownloadTxt = () => {
    setIsOpen(false);
    const safeName = (data.candidate_name || "Tailored_Resume").replace(/\s+/g, "_");
    downloadPlainText(data.raw_markdown, `${safeName}_Tailored.txt`);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(data.raw_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        {/* Quick Action: PDF Print */}
        <button
          onClick={handlePrintPdf}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700/80 text-xs font-semibold transition shadow-sm"
          title="Print or Save as PDF with ATS formatting"
        >
          <Printer className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Save / Print PDF</span>
        </button>

        {/* Primary Export Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{downloadingDocx ? "Generating..." : "Download Options"}</span>
          <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
        </button>
      </div>

      {/* Menu popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl z-50">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Export Formats
          </div>

          {/* Download Word DOCX */}
          <button
            onClick={handleDownloadDocx}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 hover:text-indigo-900 dark:hover:text-white transition"
          >
            <FileDown className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            <div className="text-left">
              <span className="font-medium block">Word (.DOCX)</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Editable ATS template</span>
            </div>
          </button>

          {/* Print/Save PDF */}
          <button
            onClick={handlePrintPdf}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 hover:text-indigo-900 dark:hover:text-white transition"
          >
            <Printer className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            <div className="text-left">
              <span className="font-medium block">PDF Document</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Clean 1-page/2-page print</span>
            </div>
          </button>

          {/* Markdown (.md) */}
          <button
            onClick={handleDownloadMarkdown}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 hover:text-indigo-900 dark:hover:text-white transition"
          >
            <FileText className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <div className="text-left">
              <span className="font-medium block">Markdown (.md)</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Formatted plain text</span>
            </div>
          </button>

          {/* Plain Text (.txt) */}
          <button
            onClick={handleDownloadTxt}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 hover:text-indigo-900 dark:hover:text-white transition"
          >
            <FileText className="h-4 w-4 text-slate-400" />
            <div className="text-left">
              <span className="font-medium block">Plain Text (.txt)</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Raw text file</span>
            </div>
          </button>

          <div className="my-1 border-t border-slate-200 dark:border-slate-800"></div>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 hover:text-indigo-900 dark:hover:text-white transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
            <span className="font-medium">{copied ? "Copied!" : "Copy Full Markdown"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
