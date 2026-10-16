"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Edit2,
  CheckCircle2,
  FileCheck2,
  Layers,
} from "lucide-react";
import { TailoredResumeResponse } from "../types/resume";

interface ResumePreviewProps {
  data: TailoredResumeResponse;
  onUpdateData: (updated: TailoredResumeResponse) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, onUpdateData }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [onePageFit, setOnePageFit] = useState(true);

  const handleCopy = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const updateSummary = (newSummary: string) => {
    onUpdateData({
      ...data,
      summary: newSummary,
    });
  };

  const updateBullet = (expIndex: number, bulletIndex: number, newBullet: string) => {
    const newExperience = [...data.experience];
    const targetExp = { ...newExperience[expIndex] };
    const bullets = [...(targetExp.tailored_bullets || targetExp.original_bullets)];
    bullets[bulletIndex] = newBullet;
    targetExp.tailored_bullets = bullets;
    newExperience[expIndex] = targetExp;

    onUpdateData({
      ...data,
      experience: newExperience,
    });
  };

  return (
    <div className="relative">
      {/* Top Toolbar: 1-Page Fit Toggle & In-Line Edit Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 no-print">
        <div className="flex items-center gap-2 text-xs">
          {onePageFit ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
              <span>1-Page ATS Fit <span className="hidden sm:inline">(Executive compact layout)</span></span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span>Standard Spacing</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Page Fit Toggle Button */}
          <button
            type="button"
            onClick={() => setOnePageFit(!onePageFit)}
            title="Toggle between single-page compact layout and standard spacious layout"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              onePageFit
                ? "bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{onePageFit ? "1-Page: ON" : "1-Page: OFF"}</span>
          </button>

          {/* Edit In-Line Toggle Button */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              isEditing
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            {isEditing ? <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> : <Edit2 className="h-3.5 w-3.5" />}
            <span>{isEditing ? "Done" : "Edit In-line"}</span>
          </button>
        </div>
      </div>

      {/* ATS Paper Document Container (Always White Paper at all times) */}
      <div
        id="printable-resume-container"
        className={`rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl transition-all ${
          onePageFit ? "p-6 sm:p-7 max-w-4xl mx-auto" : "p-8 sm:p-10"
        }`}
      >
        {/* Candidate Header */}
        <header
          className={`text-center border-b border-slate-200 ${
            onePageFit ? "pb-3 mb-3.5" : "pb-5 mb-5"
          }`}
        >
          {isEditing ? (
            <input
              type="text"
              value={data.candidate_name}
              onChange={(e) => onUpdateData({ ...data, candidate_name: e.target.value })}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-center w-full border-b border-dashed border-indigo-400 focus:outline-none bg-transparent"
            />
          ) : (
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {data.candidate_name || "Candidate Name"}
            </h1>
          )}

          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-xs font-medium text-slate-600">
            {data.contact_info?.email && <span>{data.contact_info.email}</span>}
            {data.contact_info?.phone && (
              <>
                <span>•</span>
                <span>{data.contact_info.phone}</span>
              </>
            )}
            {data.contact_info?.location && (
              <>
                <span>•</span>
                <span>{data.contact_info.location}</span>
              </>
            )}
            {data.contact_info?.linkedin && (
              <>
                <span>•</span>
                <a
                  href={data.contact_info.linkedin.startsWith("http") ? data.contact_info.linkedin : `https://${data.contact_info.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  LinkedIn
                </a>
              </>
            )}
            {data.contact_info?.github && (
              <>
                <span>•</span>
                <a
                  href={data.contact_info.github.startsWith("http") ? data.contact_info.github : `https://${data.contact_info.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  GitHub
                </a>
              </>
            )}
            {data.contact_info?.portfolio && (
              <>
                <span>•</span>
                <a
                  href={data.contact_info.portfolio.startsWith("http") ? data.contact_info.portfolio : `https://${data.contact_info.portfolio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Portfolio
                </a>
              </>
            )}
          </div>
        </header>

        {/* 1. Professional Summary */}
        {data.summary && (
          <section className={`group relative ${onePageFit ? "mb-3.5" : "mb-6"}`}>
            <div
              className={`flex items-center justify-between border-b border-slate-900 ${
                onePageFit ? "pb-0.5 mb-1.5" : "pb-1 mb-2.5"
              }`}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Professional Summary
              </h2>
              <button
                type="button"
                onClick={() => handleCopy(data.summary, "summary")}
                className="no-print opacity-0 group-hover:opacity-100 transition text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-slate-200"
              >
                {copiedSection === "summary" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSection === "summary" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            {isEditing ? (
              <textarea
                value={data.summary}
                onChange={(e) => updateSummary(e.target.value)}
                rows={3}
                className="w-full text-xs leading-normal font-normal p-2 border border-dashed border-indigo-400 rounded focus:outline-none bg-transparent text-slate-800"
              />
            ) : (
              <p
                className={`font-normal text-justify text-slate-800 ${
                  onePageFit ? "text-xs leading-normal" : "text-xs sm:text-[13px] leading-relaxed"
                }`}
              >
                {data.summary}
              </p>
            )}
          </section>
        )}

        {/* 2. Technical Skills */}
        {data.skill_groups && data.skill_groups.length > 0 && (
          <section className={`group relative ${onePageFit ? "mb-3.5" : "mb-6"}`}>
            <div
              className={`flex items-center justify-between border-b border-slate-900 ${
                onePageFit ? "pb-0.5 mb-1.5" : "pb-1 mb-2.5"
              }`}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Technical Skills
              </h2>
            </div>
            <div className={`${onePageFit ? "space-y-1 text-xs" : "space-y-1.5 text-xs sm:text-[13px]"}`}>
              {data.skill_groups.map((group, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="font-bold text-slate-900 shrink-0 min-w-[130px] sm:min-w-[140px]">
                    {group.category}:
                  </span>
                  <span className="text-slate-800">
                    {group.skills.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Professional Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className={`${onePageFit ? "mb-3.5" : "mb-6"}`}>
            <div
              className={`border-b border-slate-900 ${
                onePageFit ? "pb-0.5 mb-2" : "pb-1 mb-3"
              }`}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Professional Experience
              </h2>
            </div>
            <div className={`${onePageFit ? "space-y-2.5" : "space-y-4"}`}>
              {data.experience.map((job, expIdx) => (
                <div key={expIdx} className="group relative">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {job.role}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                        {" "}— {job.company}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500">
                      {job.location && <span>{job.location} | </span>}
                      <span>{job.duration}</span>
                    </div>
                  </div>

                  <ul
                    className={`list-disc pl-5 text-slate-800 ${
                      onePageFit
                        ? "mt-1 space-y-0.5 text-xs leading-normal"
                        : "mt-1.5 space-y-1 text-xs sm:text-[12.5px] leading-relaxed"
                    }`}
                  >
                    {(job.tailored_bullets && job.tailored_bullets.length > 0
                      ? job.tailored_bullets
                      : job.original_bullets
                    ).map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="text-justify">
                        {isEditing ? (
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateBullet(expIdx, bulletIdx, e.target.value)}
                            className="w-full border-b border-dashed border-indigo-400 focus:outline-none bg-transparent text-slate-900"
                          />
                        ) : (
                          bullet
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className={`${onePageFit ? "mb-3.5" : "mb-6"}`}>
            <div
              className={`border-b border-slate-900 ${
                onePageFit ? "pb-0.5 mb-2" : "pb-1 mb-3"
              }`}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Projects
              </h2>
            </div>
            <div className={`${onePageFit ? "space-y-2" : "space-y-3"}`}>
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {proj.title}
                    </span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-[11px] font-medium text-slate-600">
                        [{proj.technologies.join(", ")}]
                      </span>
                    )}
                  </div>
                  {proj.description && proj.description !== proj.title && (
                    <p className="text-xs mt-0.5 text-slate-600">
                      {proj.description}
                    </p>
                  )}
                  {proj.tailored_bullets && proj.tailored_bullets.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 space-y-0.5 text-xs text-slate-800">
                      {proj.tailored_bullets.map((b, bIdx) => (
                        <li key={bIdx} className="text-justify">{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Education */}
        {data.education && data.education.length > 0 && (
          <section className="mb-1">
            <div
              className={`border-b border-slate-900 ${
                onePageFit ? "pb-0.5 mb-1.5" : "pb-1 mb-2.5"
              }`}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Education
              </h2>
            </div>
            <div className={`${onePageFit ? "space-y-1 text-xs" : "space-y-2 text-xs sm:text-[13px]"}`}>
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <span className="font-bold text-slate-900">
                      {edu.degree}
                    </span>
                    <span className="text-slate-700">
                      {" "}— {edu.institution}
                    </span>
                    {edu.gpa_or_honors && (
                      <span className="font-medium text-slate-500">
                        {" "}
                        ({edu.gpa_or_honors})
                      </span>
                    )}
                  </div>
                  {edu.year && (
                    <span className="text-[11px] font-medium text-slate-500">
                      {edu.year}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Honors & Leadership */}
        {data.achievements && data.achievements.length > 0 && (
          <section className="mb-1">
            <div
              className={`border-b border-slate-900 ${
                onePageFit ? "pb-0.5 mb-1.5" : "pb-1 mb-2.5"
              }`}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Honors & Leadership
              </h2>
            </div>
            <div className={`${onePageFit ? "space-y-1 text-xs" : "space-y-1.5 text-xs sm:text-[13px]"}`}>
              {data.achievements.map((item, idx) => (
                <div
                  key={idx}
                  className="text-justify flex items-start gap-1.5 text-slate-800"
                >
                  <span className="font-bold shrink-0 text-slate-900">
                    •
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
