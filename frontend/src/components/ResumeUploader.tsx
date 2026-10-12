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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
            1
          </span>
          <h2 className="text-base font-semibold text-white">Upload Your Resume</h2>
        </div>
        
        {resumeText && (
          <div className="flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "card" ? "text" : "card")}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <Edit3 className="h-3 w-3" />
              <span>{viewMode === "card" ? "View / Edit Text" : "Card View"}</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Upload your <strong className="text-slate-300">PDF</strong> or <strong className="text-slate-300">DOCX</strong> resume. Exact document details, tables, and formatting are extracted and passed to the LLM API for deep inspection.
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
              ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
              : "border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800/40"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-2" />
              <p className="text-sm font-medium text-slate-200">Parsing document structure...</p>
              <p className="text-xs text-slate-400">Inspecting pages, tables, contact info & sections</p>
            </div>
          ) : (
            <>
              <div className="mb-3 rounded-xl bg-indigo-500/10 p-3 ring-1 ring-indigo-500/20 text-indigo-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-200">
                Click to browse or drag & drop your resume
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF or DOCX up to 10MB (Preserves exact layout & tables)</p>
            </>
          )}
        </div>
      )}

      {/* Active File Card */}
      {(parsedMetadata || (resumeText && viewMode === "card")) && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-indigo-500/20 p-2.5 text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-[280px]">
                    {parsedMetadata?.filename || pdfFilename || "resume_input.txt"}
                  </span>
                  <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                    {parsedMetadata?.file_type || "PDF"}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
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
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
              title="Remove resume"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Multimodal LLM inspection indicator badge */}
          {pdfBase64 && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Full PDF Document attached for LLM API inspection (page layout, tables & exact details preserved)</span>
            </div>
          )}

          {/* Detected Candidate Details Pill List */}
          {(candidateInfo.name || candidateInfo.email || candidateInfo.phone) && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {candidateInfo.name && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">
                    <span className="text-slate-500">Name:</span> {candidateInfo.name}
                  </span>
                )}
                {candidateInfo.email && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">
                    <span className="text-slate-500">Email:</span> {candidateInfo.email}
                  </span>
                )}
                {candidateInfo.phone && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">
                    <span className="text-slate-500">Phone:</span> {candidateInfo.phone}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowDetailsEditor(!showDetailsEditor)}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <User className="h-3 w-3" />
                <span>{showDetailsEditor ? "Close Details" : "Edit Details"}</span>
                {showDetailsEditor ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          )}

          {/* Collapsible Candidate Details Editor */}
          {showDetailsEditor && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Verify or Customize Candidate Contact Info:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Full Name</label>
                  <input
                    type="text"
                    value={candidateInfo.name}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Candidate Name"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Email</label>
                  <input
                    type="email"
                    value={candidateInfo.email}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Phone Number</label>
                  <input
                    type="text"
                    value={candidateInfo.phone}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Location</label>
                  <input
                    type="text"
                    value={candidateInfo.location}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, location: e.target.value }))}
                    placeholder="City, Country / Remote"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={candidateInfo.linkedin}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, linkedin: e.target.value }))}
                    placeholder="linkedin.com/in/username"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">GitHub Profile</label>
                  <input
                    type="text"
                    value={candidateInfo.github}
                    onChange={(e) => setCandidateInfo((p) => ({ ...p, github: e.target.value }))}
                    placeholder="github.com/username"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Detected Sections badges */}
          {parsedMetadata?.sections_detected && parsedMetadata.sections_detected.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Sections Detected:</span>
              {parsedMetadata.sections_detected.slice(0, 5).map((sec, i) => (
                <span key={i} className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  ✓ {sec}
                </span>
              ))}
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
            className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono resize-y"
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
