"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
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
  CheckCircle2,
} from "lucide-react";

import { Navbar } from "../components/Navbar";
import { ResumeUploader, CandidateContactInfo } from "../components/ResumeUploader";
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
import { checkBackendHealth, tailorResume } from "../lib/api";

interface ResumeVersion {
  id: number;
  label: string;
  tone: string;
  matchScore: number;
  tailoringLens?: string;
  data: TailoredResumeResponse;
}

const STEPPER_STAGES = [
  "Reviewing resume structure & experience...",
  "Analyzing job requirements & key competencies...",
  "Refining achievements & quantifiable outcomes...",
  "Checking keyword alignment & ATS readiness...",
];

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function useStoredValue(key: string, defaultValue: string) {
  return useSyncExternalStore(
    subscribeToStorage,
    () => {
      try {
        return localStorage.getItem(key) ?? defaultValue;
      } catch {
        return defaultValue;
      }
    },
    () => defaultValue
  );
}

export default function HomePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [parsedMetadata, setParsedMetadata] = useState<ParsedResumeResponse | null>(null);

  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [candidateInfo, setCandidateInfo] = useState<CandidateContactInfo>({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

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
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resume" | "diff" | "ats" | "cover_letter" | "markdown">("resume");
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; llm_engine?: string }>({
    online: false,
  });

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem("cleanlab_theme") || localStorage.getItem("preplab_theme")) as "dark" | "light" | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
        if (savedTheme === "light") {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("cleanlab_theme", next);
      if (next === "light") {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      }
    } catch {
      // ignore
    }
  };

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

  // Neutralize 3rd-party extension overlays (e.g. Careerflow) and Next.js dev overlays
  useEffect(() => {
    const cleanInjectedElements = () => {
      try {
        const extensionSelectors = [
          "#careerflow-extension-root",
          "#careerflow-root",
          "careerflow-container",
          "careerflow-widget",
          "careerflow-sidebar",
          "[data-careerflow]",
          ".cf-extension-container",
          "nextjs-portal",
          "[data-nextjs-dev-tools-button]",
        ];
        document.querySelectorAll(extensionSelectors.join(",")).forEach((el) => {
          el.remove();
        });

        const candidates = document.querySelectorAll("body > div, body > aside, body > section, body > iframe");
        candidates.forEach((el) => {
          const text = (el.textContent || "").toLowerCase();
          if (
            text.includes("careerflow") ||
            text.includes("signintoviewdetails") ||
            text.includes("sign in on careerflow")
          ) {
            el.remove();
          }
        });
      } catch {
        // ignore
      }
    };

    cleanInjectedElements();
    const observer = new MutationObserver(() => {
      cleanInjectedElements();
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, []);

  const handleDetectRoleAndCompany = (role: string, company: string) => {
    setOptions((prev) => ({
      ...prev,
      ...(role ? { target_role: role } : {}),
      ...(company ? { target_company: company } : {}),
    }));
  };

  const handleReset = () => {
    setResumeText("");
    setJobDescription("");
    setParsedMetadata(null);
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
    setTailoredResult(null);
    setVersions([]);
    setActiveVersionId(null);
    setErrorMessage(null);
    setWarningMessage(null);
    setActiveTab("resume");
  };

  const handleTailorSubmit = async () => {
    setErrorMessage(null);
    setWarningMessage(null);

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
        candidate_name: candidateInfo.name || parsedMetadata?.detected_name,
        candidate_email: candidateInfo.email || parsedMetadata?.detected_email,
        candidate_phone: candidateInfo.phone || parsedMetadata?.detected_phone,
        candidate_location: candidateInfo.location || parsedMetadata?.detected_location,
        candidate_linkedin: candidateInfo.linkedin || parsedMetadata?.detected_linkedin,
        candidate_github: candidateInfo.github || parsedMetadata?.detected_github,
        candidate_portfolio: candidateInfo.portfolio || parsedMetadata?.detected_portfolio,
        pdf_base64: pdfBase64 || undefined,
        pdf_filename: pdfFilename || parsedMetadata?.filename || undefined,
        options: {
          ...options,
          candidate_portfolio: candidateInfo.portfolio || parsedMetadata?.detected_portfolio,
          iteration_seed: versions.length + 1,
        },
      });

      if (res.api_warning) {
        setWarningMessage(res.api_warning);
      } else {
        setWarningMessage(null);
      }

      // Add to versions
      const newVersionId = versions.length + 1;
      const lensTitle = res.tailoring_lens ? res.tailoring_lens.split("&")[0].trim() : (
        options.tone === "impact_metrics"
          ? "Impact & Metrics"
          : options.tone === "technical"
          ? "Technical"
          : options.tone === "executive"
          ? "Executive"
          : "Standard ATS"
      );

      const newVersion: ResumeVersion = {
        id: newVersionId,
        label: `v${newVersionId}: ${lensTitle}`,
        tone: options.tone,
        matchScore: res.match_score_after,
        tailoringLens: res.tailoring_lens,
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
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      theme === "dark" ? "bg-[#090d16] text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Navbar */}
      <Navbar
        backendStatus={backendStatus}
        onReset={handleReset}
        isCustomizing={isProcessing}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Tagline */}
        <div className="mb-8 text-center max-w-2xl mx-auto no-print">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tailor Your Resume for Any Role
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Align your real accomplishments with target job requirements, optimize for ATS screening, and highlight matching skills.
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

        {/* Global Warning / Provider Alert Banner */}
        {warningMessage && (
          <div className="mb-6 flex items-start justify-between rounded-xl bg-amber-500/15 border border-amber-500/30 p-4 text-xs sm:text-sm text-amber-200 no-print">
            <div className="flex items-start space-x-3">
              <span className="text-xl leading-none">⚠️</span>
              <div className="space-y-1">
                <span className="font-semibold text-amber-300 text-sm">LLM Provider Status Notice</span>
                <p className="whitespace-pre-line text-xs text-amber-100/90 leading-relaxed font-sans">{warningMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setWarningMessage(null)}
              className="text-xs text-amber-400 hover:text-white px-2 py-1 shrink-0 ml-3"
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
              pdfBase64={pdfBase64}
              setPdfBase64={setPdfBase64}
              pdfFilename={pdfFilename}
              setPdfFilename={setPdfFilename}
              candidateInfo={candidateInfo}
              setCandidateInfo={setCandidateInfo}
            />

            {/* 2. Job Description Input */}
            <JobDescriptionInput
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onDetectRoleAndCompany={handleDetectRoleAndCompany}
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
              className="w-full relative group overflow-hidden rounded-2xl bg-indigo-600 hover:bg-indigo-700 p-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center space-x-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Tailoring Resume...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-indigo-200" />
                      <span>Tailor for this Role</span>
                      <ArrowRight className="h-4 w-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </div>

                {/* Progressive Live Stepper Message */}
                {isProcessing && (
                  <span className="text-[11px] text-indigo-200 font-normal">
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
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 sm:p-12 text-center backdrop-blur-sm shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 ring-1 ring-indigo-200 dark:ring-indigo-500/20">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your tailored resume will appear here</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Upload your resume, paste the target job description, and tailor your bullet points and skills for the role.
                </p>

                {resumeText ? (
                  <div className="mt-6 flex flex-col items-center justify-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Resume & JD Ready</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTailorSubmit}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Tailor Resume for Role</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 flex items-center justify-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Upload your resume in the panel on the left to get started
                    </span>
                  </div>
                )}

                {/* Steps Checklist */}
                <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold block mb-1">Step 1</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300">Upload PDF or Word resume</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold block mb-1">Step 2</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300">Add target job description</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold block mb-1">Step 3</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300">Review & export 1-page PDF</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Result State */
              <div className="space-y-4">
                {/* Clean Variations Switcher */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 flex flex-wrap items-center justify-between gap-2.5 no-print shadow-xs">
                  <div className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Variations ({versions.length}):</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {versions.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSwitchVersion(v)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                          activeVersionId === v.id
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {v.label} <span className="font-semibold ml-1 text-emerald-600 dark:text-emerald-400">{v.matchScore}%</span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={handleTailorSubmit}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Tailoring...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                          <span>+ New Variation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="no-print">
                  <MetricsBar
                    data={tailoredResult}
                    onOpenATSModal={() => setActiveTab("ats")}
                  />
                </div>

                {/* Tab Navigation & Export Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 no-print">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setActiveTab("resume")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        activeTab === "resume"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Tailored Resume</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("diff")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        activeTab === "diff"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <GitCompare className="h-3.5 w-3.5" />
                      <span>Key Improvements</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("ats")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        activeTab === "ats"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>ATS Breakdown</span>
                    </button>

                    {tailoredResult.cover_letter && (
                      <button
                        onClick={() => setActiveTab("cover_letter")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          activeTab === "cover_letter"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 p-4 font-mono text-xs text-slate-800 dark:text-slate-300 whitespace-pre-wrap">
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
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#090d16] py-6 text-center text-xs text-slate-500 transition-colors duration-200 no-print">
        <p>
          Full-Stack Developer Assignment Project • Built with Next.js (App Router), Python (FastAPI), and AI/LLM integration.
        </p>
      </footer>
    </div>
  );
}
