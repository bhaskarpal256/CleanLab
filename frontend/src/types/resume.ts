export interface ParsedResumeResponse {
  filename: string;
  file_size_bytes: number;
  file_size_formatted: string;
  file_type: string;
  character_count: number;
  word_count: number;
  extracted_text: string;
  detected_name?: string;
  detected_email?: string;
  detected_phone?: string;
  sections_detected: string[];
}

export interface CustomizationOptions {
  target_role?: string;
  tone: "impact_metrics" | "balanced" | "technical" | "executive";
  sections_to_customize: string[];
  generate_cover_letter: boolean;
  target_company?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration?: string;
  location?: string;
  original_bullets: string[];
  tailored_bullets: string[];
  key_changes: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  year?: string;
  gpa_or_honors?: string;
}

export interface ProjectItem {
  title: string;
  technologies: string[];
  description: string;
  tailored_bullets: string[];
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface ATSChecklistItem {
  category: string;
  status: "pass" | "warning" | "fail";
  message: string;
}

export interface ATSEvaluation {
  overall_score: number;
  matched_keywords_count: number;
  missing_keywords_count: number;
  formatting_score: number;
  action_verbs_score: number;
  quantifiable_metrics_score: number;
  checklist: ATSChecklistItem[];
  actionable_advice: string[];
}

export interface TailoredResumeResponse {
  success: boolean;
  match_score_before: number;
  match_score_after: number;
  ats_score: number;
  ats_evaluation: ATSEvaluation;
  matched_keywords: string[];
  missing_keywords: string[];
  candidate_name: string;
  contact_info: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  original_summary?: string;
  skill_groups: SkillGroup[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  cover_letter?: string;
  diff_summary: string[];
  raw_markdown: string;
  provider_used: string;
  model_used: string;
  is_demo_mode: boolean;
}
