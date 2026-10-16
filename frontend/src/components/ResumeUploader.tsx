"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Edit3,
  X,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  User,
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { ParsedResumeResponse } from "../types/resume";
import { parseResumeFile, fileToBase64 } from "../lib/api";

export interface CandidateContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio?: string;
}

interface ResumeUploaderProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  parsedMetadata: ParsedResumeResponse | null;
  setParsedMetadata: (data: ParsedResumeResponse | null) => void;
  isProcessing: boolean;
  pdfBase64: string | null;
  setPdfBase64: (val: string | null) => void;
  pdfFilename: string | null;
  setPdfFilename: (val: string | null) => void;
  candidateInfo: CandidateContactInfo;
  setCandidateInfo: React.Dispatch<React.SetStateAction<CandidateContactInfo>>;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  resumeText,
  setResumeText,
  parsedMetadata,
  setParsedMetadata,
  isProcessing,
  pdfBase64,
  setPdfBase64,
  pdfFilename,
  setPdfFilename,
  candidateInfo,
  setCandidateInfo,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "text">("card");
  const [showDetailsEditor, setShowDetailsEditor] = useState(false);
  const [showAtsBreakdown, setShowAtsBreakdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    const validExtensions = [".pdf", ".docx", ".doc", ".txt"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      setErrorMessage("Please upload a PDF (.pdf) or Word document (.docx).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    try {
      setUploading(true);
      const result = await parseResumeFile(file);
      setParsedMetadata(result);
      setResumeText(result.extracted_text);

      if (ext === ".pdf") {
        try {
          const b64 = await fileToBase64(file);
          setPdfBase64(b64);
          setPdfFilename(file.name);
        } catch (err) {
          console.error("Could not encode PDF file to base64:", err);
        }
      } else {
        setPdfBase64(null);
        setPdfFilename(null);
      }

      setCandidateInfo({
        name: result.detected_name || "",
        email: result.detected_email || "",
        phone: result.detected_phone || "",
        location: result.detected_location || "",
        linkedin: result.detected_linkedin || "",
        github: result.detected_github || "",
        portfolio: result.detected_portfolio || "",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to extract text from file.";
      setErrorMessage(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    setParsedMetadata(null);
    setResumeText("");
    setPdfBase64(null);
    setPdfFilename(null);
    setCandidateInfo({
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
    });
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-sm shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            1
          </span>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Upload Your Resume</h2>
        </div>
        
        {resumeText && (
          <div className="flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "card" ? "text" : "card")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-transparent transition"
            >
              <Edit3 className="h-3 w-3" />
              <span>{viewMode === "card" ? "View / Edit Text" : "Card View"}</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
        Upload your PDF or Word document (.docx) to get started.
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        disabled={uploading || isProcessing}
      />

      {/* Dropzone if no file uploaded */}
      {!parsedMetadata && !resumeText && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.01]"
              : "border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 dark:border-slate-700/80 dark:hover:border-indigo-500/50 dark:hover:bg-slate-800/40"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400 mb-2" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Reading resume...</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Extracting experience, projects & skills</p>
            </div>
          ) : (
            <>
              <div className="mb-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-3 ring-1 ring-indigo-200 dark:ring-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Click to browse or drag & drop your resume
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF or DOCX up to 10MB</p>
            </>
          )}
        </div>
      )}

      {/* Active File Card */}
      {(parsedMetadata || (resumeText && viewMode === "card")) && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/20 p-2.5 text-indigo-600 dark:text-indigo-400 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-sm font-medium text-slate-900 dark:text-white truncate min-w-0">
                    {parsedMetadata?.filename || pdfFilename || "resume_input.txt"}
                  </span>
                  <span className="shrink-0 rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    {parsedMetadata?.file_type || "PDF"}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {parsedMetadata?.file_size_formatted && (
                    <span>{parsedMetadata.file_size_formatted}</span>
                  )}
                  {parsedMetadata?.page_count && (
                    <>
                      <span>•</span>
                      <span>{parsedMetadata.page_count} {parsedMetadata.page_count === 1 ? "page" : "pages"}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRemove}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500 dark:hover:text-rose-400 transition"
              title="Remove resume"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {pdfBase64 && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Original document layout & tables preserved</span>
            </div>
          )}

          {/* Detected Candidate Details Pill List */}
          {(candidateInfo.name || candidateInfo.email || candidateInfo.phone) && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2 max-w-full">
                {candidateInfo.name && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300 max-w-[180px] truncate border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 dark:text-slate-500 shrink-0">Name:</span> <span className="truncate">{candidateInfo.name}</span>
                  </span>
                )}
                {candidateInfo.email && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300 max-w-[240px] truncate border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 dark:text-slate-500 shrink-0">Email:</span> <span className="truncate">{candidateInfo.email}</span>
                  </span>
                )}
                {candidateInfo.phone && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300 max-w-[160px] truncate border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 dark:text-slate-500 shrink-0">Phone:</span> <span className="truncate">{candidateInfo.phone}</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowDetailsEditor(!showDetailsEditor)}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                <User className="h-3 w-3" />
                <span>{showDetailsEditor ? "Close" : "Edit Contact"}</span>
                {showDetailsEditor ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          )}

          {/* Collapsible Candidate Details Editor */}
          {showDetailsEditor && (
            <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-300 block">
                Verify or Update Contact Details:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">Full Name</label>
                  <input
                    type="text"
                    value={candidateInfo.name}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Candidate Name"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">Email</label>
                  <input
                    type="email"
                    value={candidateInfo.email}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">Phone Number</label>
                  <input
                    type="text"
                    value={candidateInfo.phone}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">Location</label>
                  <input
                    type="text"
                    value={candidateInfo.location}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, location: e.target.value }))}
                    placeholder="City, Country / Remote"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={candidateInfo.linkedin}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, linkedin: e.target.value }))}
                    placeholder="linkedin.com/in/username"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">GitHub Profile</label>
                  <input
                    type="text"
                    value={candidateInfo.github}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, github: e.target.value }))}
                    placeholder="github.com/username"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">Portfolio Link</label>
                  <input
                    type="text"
                    value={candidateInfo.portfolio || ""}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, portfolio: e.target.value }))}
                    placeholder="portfolio.vercel.app or portfolio website"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Detected Sections badges */}
          {parsedMetadata?.sections_detected && parsedMetadata.sections_detected.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sections:</span>
              {parsedMetadata.sections_detected.map((sec, i) => (
                <span key={i} className="rounded bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                  {sec}
                </span>
              ))}
            </div>
          )}

          {/* Extracted Projects Pills */}
          {parsedMetadata?.detected_projects && parsedMetadata.detected_projects.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Projects ({parsedMetadata.detected_projects.length}):
              </span>
              {parsedMetadata.detected_projects.map((proj, i) => (
                <span key={i} className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
                  {proj}
                </span>
              ))}
            </div>
          )}

          {/* Uploaded Resume ATS Readability Baseline (Compact) */}
          {parsedMetadata?.ats_evaluation && (
            <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    ATS Readability Baseline
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {parsedMetadata.initial_ats_score ?? parsedMetadata.ats_evaluation.overall_score}/100
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAtsBreakdown(!showAtsBreakdown)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {showAtsBreakdown ? "Hide" : "Details"}
                  </button>
                </div>
              </div>

              {showAtsBreakdown && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                  {parsedMetadata.ats_evaluation.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{item.category}</span>
                      <span className={item.status === "pass" ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-amber-600 dark:text-amber-400 font-medium"}>
                        {item.status === "pass" ? "Pass" : "Notice"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Raw Text Editor View */}
      {resumeText && viewMode === "text" && (
        <div className="mt-2">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={7}
            placeholder="Paste or review raw resume content here..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/80 p-3 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono resize-y"
          />
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="mt-3 flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
