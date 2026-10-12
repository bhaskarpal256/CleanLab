"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  FileText,
  GitCompare,
  ShieldCheck,
  Mail,
  Code,
  AlertCircle,
  Zap,
  History,
} from "lucide-react";

import { Navbar } from "../components/Navbar";
import { ResumeUploader } from "../components/ResumeUploader";
import { JobDescriptionInput } from "../components/JobDescriptionInput";
import { CustomizationSettings } from "../components/CustomizationSettings";
import { MetricsBar } from "../components/MetricsBar";
import { ResumePreview } from "../components/ResumePreview";
import { DiffView } from "../components/DiffView";
import { ATSAnalysisTab } from "../components/ATSAnalysisTab";
import { CoverLetterView } from "../components/CoverLetterView";
import { ExportDropdown } from "../components/ExportDropdown";

import {
  ParsedResumeResponse,
  TailoredResumeResponse,
  CustomizationOptions,
} from "../types/resume";
import { checkBackendHealth, tailorResume, fetchSampleData } from "../lib/api";

interface ResumeVersion {
  id: number;
  label: string;
  tone: string;
  matchScore: number;
  data: TailoredResumeResponse;
}

const STEPPER_STAGES = [
  "Parsing candidate resume content & structure...",
  "Analyzing target Job Description & key competencies...",
  "Aligning experience bullets with Google XYZ formula...",
  "Synthesizing ATS keyword density & scoring fit...",
];

export default function HomePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [parsedMetadata, setParsedMetadata] = useState<ParsedResumeResponse | null>(null);

  const [options, setOptions] = useState<CustomizationOptions>({
    target_role: "",
    tone: "impact_metrics",
    sections_to_customize: ["summary", "skills", "experience", "projects"],
    generate_cover_letter: true,
    target_company: "",
  });

  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<number | null>(null);
  const [tailoredResult, setTailoredResult] = useState<TailoredResumeResponse | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [stepperIndex, setStepperIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resume" | "diff" | "ats" | "cover_letter" | "markdown">("resume");
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; llm_engine?: string }>({
    online: false,
  });

  // Cycle progressive stepper message during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setStepperIndex((prev) => (prev + 1) % STEPPER_STAGES.length);
      }, 1100);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const status = await checkBackendHealth();
      setBackendStatus(status);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Load Demo Case
  const handleLoadDemo = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const demo = await fetchSampleData();
      setJobDescription(demo.job_description);
      setResumeText(demo.resume_text);
      setParsedMetadata({
        filename: "Bhaskar_Sharma_Resume.pdf",
        file_size_bytes: 42300,
        file_size_formatted: "41.3 KB",
        file_type: "PDF",
        character_count: demo.resume_text.length,
        word_count: demo.resume_text.split(/\s+/).filter(Boolean).length,
        extracted_text: demo.resume_text,
        detected_name: "Bhaskar Sharma",
        detected_email: "bhaskar.sharma@example.com",
        detected_phone: "+91 98765 43210",
        sections_detected: ["Summary", "Skills", "Experience", "Projects", "Education"],
      });
      setOptions((prev) => ({
        ...prev,
        target_role: demo.role_title,
        target_company: demo.company,
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not load sample data";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResumeText("");
    setJobDescription("");
    setParsedMetadata(null);
    setTailoredResult(null);
    setVersions([]);
    setActiveVersionId(null);
    setErrorMessage(null);
    setActiveTab("resume");
  };

  const handleTailorSubmit = async () => {
    setErrorMessage(null);

    if (!resumeText || resumeText.trim().length < 30) {
      setErrorMessage("Please upload your resume or paste the text content first (minimum 30 characters).");
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 30) {
      setErrorMessage("Please paste the target Job Description (minimum 30 characters).");
      return;
    }

    try {
      setStepperIndex(0);
      setIsProcessing(true);
      const res = await tailorResume({
        resume_text: resumeText,
        job_description: jobDescription,
        candidate_name: parsedMetadata?.detected_name,
        candidate_email: parsedMetadata?.detected_email,
        candidate_phone: parsedMetadata?.detected_phone,
        options,
      });

      // Add to versions
      const newVersionId = versions.length + 1;
      const toneLabel =
        options.tone === "impact_metrics"
          ? "Impact & Metrics"
          : options.tone === "technical"
          ? "Technical"
          : options.tone === "executive"
          ? "Executive"
          : "Standard ATS";

      const newVersion: ResumeVersion = {
        id: newVersionId,
        label: `v${newVersionId} (${toneLabel})`,
        tone: options.tone,
        matchScore: res.match_score_after,
        data: res,
      };

      setVersions((prev) => [...prev, newVersion]);
      setActiveVersionId(newVersionId);
      setTailoredResult(res);
      setActiveTab("resume");

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to customize resume. Please check backend.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwitchVersion = (version: ResumeVersion) => {
    setActiveVersionId(version.id);
    setTailoredResult(version.data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Top Navbar */}
      <Navbar
        backendStatus={backendStatus}
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        isCustomizing={isProcessing}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Tagline */}
        <div className="mb-8 text-center max-w-3xl mx-auto no-print">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Resume Optimization Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Tailor Your Resume to Any <span className="text-gradient">Job Description</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto">
            Extract keywords from the JD, re-frame experience bullets using the Google XYZ impact formula,
            maximize ATS match score, and download ready-to-send PDF and DOCX formats.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-rose-500/15 border border-rose-500/30 p-4 text-xs sm:text-sm text-rose-300 no-print">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-white px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Inputs & Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6 no-print">
            {/* 1. Resume Uploader */}
            <ResumeUploader
              resumeText={resumeText}
              setResumeText={setResumeText}
              parsedMetadata={parsedMetadata}
              setParsedMetadata={setParsedMetadata}
              isProcessing={isProcessing}
            />

            {/* 2. Job Description Input */}
            <JobDescriptionInput
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              isProcessing={isProcessing}
            />

            {/* 3. Customization Preferences */}
            <CustomizationSettings
              options={options}
              setOptions={setOptions}
              isProcessing={isProcessing}
            />

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleTailorSubmit}
              disabled={isProcessing}
              className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 p-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center space-x-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Optimizing Resume with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
                      <span>Tailor Resume with AI</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>

                {/* Progressive Live Stepper Message */}
                {isProcessing && (
                  <span className="text-[11px] text-indigo-200 font-normal animate-pulse">
                    {STEPPER_STAGES[stepperIndex]}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* RIGHT COLUMN: Output & Workspace (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!tailoredResult ? (
              /* Empty State */
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 sm:p-12 text-center backdrop-blur-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 ring-1 ring-indigo-500/20">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Your Tailored Resume will appear here</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Upload your current PDF or DOCX resume, paste the target Job Description, and our AI will
                  generate an ATS-optimized version with keyword metrics and a matching cover letter.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleLoadDemo}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Try With Demo Case</span>
                  </button>
                </div>

                {/* Steps Checklist */}
                <div className="mt-8 border-t border-slate-800 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-indigo-400 text-xs font-bold block mb-1">Step 1</span>
                    <span className="text-xs text-slate-300">Parse PDF / Word document</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-indigo-400 text-xs font-bold block mb-1">Step 2</span>
                    <span className="text-xs text-slate-300">Re-align with JD keywords</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-indigo-400 text-xs font-bold block mb-1">Step 3</span>
                    <span className="text-xs text-slate-300">Export clean ATS PDF & Word</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Result State */
              <div className="space-y-6">
                {/* Bonus: Multiple Resume Versions Switcher Bar */}
                {versions.length > 1 && (
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3 flex flex-wrap items-center justify-between gap-2 no-print">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300">
                      <History className="h-4 w-4" />
                      <span>Generated Versions:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {versions.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSwitchVersion(v)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                            activeVersionId === v.id
                              ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400"
                              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {v.label} <span className="text-emerald-400 font-bold ml-1">{v.matchScore}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metrics Bar */}
                <div className="no-print">
                  <MetricsBar
                    data={tailoredResult}
                    onOpenATSModal={() => setActiveTab("ats")}
                  />
                </div>

                {/* Model Engine Badge Notice */}
                {tailoredResult.is_demo_mode && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-300 flex items-center justify-between no-print">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>
                        Generated via <strong>Built-in Smart Engine</strong>. To connect live Google Gemini, add your key in{" "}
                        <code className="text-amber-200">backend/.env</code>.
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab Navigation & Export Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 no-print">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setActiveTab("resume")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        activeTab === "resume"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Tailored Resume</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("diff")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        activeTab === "diff"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <GitCompare className="h-3.5 w-3.5" />
                      <span>Diff View</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("ats")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        activeTab === "ats"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>ATS Diagnostics</span>
                    </button>

                    {tailoredResult.cover_letter && (
                      <button
                        onClick={() => setActiveTab("cover_letter")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          activeTab === "cover_letter"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        }`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Cover Letter</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab("markdown")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        activeTab === "markdown"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <Code className="h-3.5 w-3.5" />
                      <span>Markdown</span>
                    </button>
                  </div>

                  {/* Export Options Dropdown */}
                  <ExportDropdown data={tailoredResult} />
                </div>

                {/* Tab Views */}
                <div>
                  {activeTab === "resume" && (
                    <ResumePreview
                      data={tailoredResult}
                      onUpdateData={(updated) => setTailoredResult(updated)}
                    />
                  )}

                  {activeTab === "diff" && <DiffView data={tailoredResult} />}

                  {activeTab === "ats" && <ATSAnalysisTab data={tailoredResult} />}

                  {activeTab === "cover_letter" && (
                    <CoverLetterView
                      coverLetterText={tailoredResult.cover_letter}
                      candidateName={tailoredResult.candidate_name}
                    />
                  )}

                  {activeTab === "markdown" && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                      {tailoredResult.raw_markdown}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-[#090d16] py-6 text-center text-xs text-slate-500 no-print">
        <p>
          Full-Stack Developer Assignment Project • Built with Next.js (App Router), Python (FastAPI), and AI/LLM integration.
        </p>
      </footer>
    </div>
  );
}
