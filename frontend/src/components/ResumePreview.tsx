"use client";

import React, { useState } from "react";
import { Copy, Check, Edit2, CheckCircle2, Sparkles, Briefcase, GraduationCap, Code2, FolderGit2 } from "lucide-react";
import { TailoredResumeResponse } from "../types/resume";

interface ResumePreviewProps {
  data: TailoredResumeResponse;
  onUpdateData: (updated: TailoredResumeResponse) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, onUpdateData }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
      {/* Edit Mode Toggle Bar */}
      <div className="flex items-center justify-between mb-3 no-print">
        <div className="text-xs text-slate-400">
          {isEditing ? (
            <span className="text-amber-400 font-medium">✏️ In-Line Edit Mode: Click on any text to modify</span>
          ) : (
            <span>Previewing ATS document (0.75-inch margins, standard fonts)</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            isEditing
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          {isEditing ? <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" /> : <Edit2 className="h-3.5 w-3.5" />}
          <span>{isEditing ? "Done Editing" : "Edit In-line"}</span>
        </button>
      </div>

      {/* ATS Paper Document Container */}
      <div
        id="printable-resume-container"
        className="rounded-2xl border border-slate-700/80 bg-white text-slate-900 p-8 sm:p-10 shadow-2xl transition-all"
      >
        {/* Candidate Header */}
        <header className="border-b border-slate-200 pb-5 mb-5 text-center">
          {isEditing ? (
            <input
              type="text"
              value={data.candidate_name}
              onChange={(e) => onUpdateData({ ...data, candidate_name: e.target.value })}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-center w-full border-b border-dashed border-indigo-400 focus:outline-none"
            />
          ) : (
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {data.candidate_name || "Bhaskar Sharma"}
            </h1>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
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
                <span className="text-indigo-600 font-semibold">{data.contact_info.linkedin}</span>
              </>
            )}
            {data.contact_info?.github && (
              <>
                <span>•</span>
                <span className="text-indigo-600 font-semibold">{data.contact_info.github}</span>
              </>
            )}
          </div>
        </header>

        {/* 1. Professional Summary */}
        {data.summary && (
          <section className="mb-6 group relative">
            <div className="flex items-center justify-between border-b border-indigo-600 pb-1 mb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 no-print" />
                <span>Professional Summary</span>
              </h2>
              <button
                type="button"
                onClick={() => handleCopy(data.summary, "summary")}
                className="no-print opacity-0 group-hover:opacity-100 transition text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100"
              >
                {copiedSection === "summary" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSection === "summary" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            {isEditing ? (
              <textarea
                value={data.summary}
                onChange={(e) => updateSummary(e.target.value)}
                rows={4}
                className="w-full text-xs sm:text-[13px] leading-relaxed text-slate-700 font-normal p-2 border border-dashed border-indigo-400 rounded focus:outline-none"
              />
            ) : (
              <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 font-normal text-justify">
                {data.summary}
              </p>
            )}
          </section>
        )}

        {/* 2. Technical Skills */}
        {data.skill_groups && data.skill_groups.length > 0 && (
          <section className="mb-6 group relative">
            <div className="flex items-center justify-between border-b border-indigo-600 pb-1 mb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 no-print" />
                <span>Technical Skills & Core Competencies</span>
              </h2>
            </div>
            <div className="space-y-1.5 text-xs sm:text-[13px]">
              {data.skill_groups.map((group, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="font-bold text-slate-900 shrink-0 min-w-[150px]">
                    {group.category}:
                  </span>
                  <span className="text-slate-700">
                    {group.skills.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Professional Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-6">
            <div className="border-b border-indigo-600 pb-1 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 no-print" />
                <span>Professional Experience</span>
              </h2>
            </div>
            <div className="space-y-4">
              {data.experience.map((job, expIdx) => (
                <div key={expIdx} className="group relative">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {job.role}
                      </span>
                      <span className="text-slate-700 text-xs sm:text-sm font-medium">
                        {" "}— {job.company}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {job.location && <span>{job.location} | </span>}
                      <span>{job.duration}</span>
                    </div>
                  </div>

                  <ul className="mt-1.5 list-disc pl-5 space-y-1 text-xs sm:text-[12.5px] leading-relaxed text-slate-700">
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
                            className="w-full border-b border-dashed border-indigo-400 focus:outline-none bg-transparent"
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

        {/* 4. Key Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-6">
            <div className="border-b border-indigo-600 pb-1 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <FolderGit2 className="h-3.5 w-3.5 no-print" />
                <span>Key Projects & Technical Implementations</span>
              </h2>
            </div>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {proj.title}
                    </span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-[11px] text-indigo-600 font-medium">
                        [{proj.technologies.join(", ")}]
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>
                  )}
                  {proj.tailored_bullets && proj.tailored_bullets.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 space-y-0.5 text-xs text-slate-700">
                      {proj.tailored_bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
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
          <section className="mb-2">
            <div className="border-b border-indigo-600 pb-1 mb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 no-print" />
                <span>Education</span>
              </h2>
            </div>
            <div className="space-y-2">
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-xs sm:text-[13px]">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-700"> — {edu.institution}</span>
                    {edu.gpa_or_honors && (
                      <span className="text-slate-500 font-medium"> ({edu.gpa_or_honors})</span>
                    )}
                  </div>
                  {edu.year && (
                    <span className="text-[11px] text-slate-500 font-medium">{edu.year}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
