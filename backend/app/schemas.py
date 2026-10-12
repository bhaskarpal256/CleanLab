from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ParseResumeResponse(BaseModel):
    filename: str
    file_size_bytes: int
    file_size_formatted: str
    file_type: str
    character_count: int
    word_count: int
    extracted_text: str
    detected_name: Optional[str] = None
    detected_email: Optional[str] = None
    detected_phone: Optional[str] = None
    sections_detected: List[str] = []

class CustomizationOptions(BaseModel):
    target_role: Optional[str] = None
    tone: str = Field(default="impact_metrics", description="Options: 'impact_metrics', 'balanced', 'technical', 'executive'")
    sections_to_customize: List[str] = Field(
        default=["summary", "skills", "experience", "projects"],
        description="Sections selected for customization"
    )
    generate_cover_letter: bool = True
    target_company: Optional[str] = None

class TailorResumeRequest(BaseModel):
    resume_text: str = Field(..., min_length=30, description="Extracted text from resume")
    job_description: str = Field(..., min_length=30, description="Job description text")
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None
    candidate_links: Optional[List[str]] = []
    options: Optional[CustomizationOptions] = Field(default_factory=CustomizationOptions)

class ExperienceItem(BaseModel):
    company: str
    role: str
    duration: Optional[str] = None
    location: Optional[str] = None
    original_bullets: List[str] = []
    tailored_bullets: List[str] = []
    key_changes: List[str] = []

class EducationItem(BaseModel):
    institution: str
    degree: str
    year: Optional[str] = None
    gpa_or_honors: Optional[str] = None

class ProjectItem(BaseModel):
    title: str
    technologies: List[str] = []
    description: str
    tailored_bullets: List[str] = []

class SkillGroup(BaseModel):
    category: str  # e.g., "Languages & Frameworks", "AI & Data", "Cloud & DevOps", "Core Competencies"
    skills: List[str]

class ATSChecklistItem(BaseModel):
    category: str
    status: str  # "pass", "warning", "fail"
    message: str

class ATSEvaluation(BaseModel):
    overall_score: int
    matched_keywords_count: int
    missing_keywords_count: int
    formatting_score: int
    action_verbs_score: int
    quantifiable_metrics_score: int
    checklist: List[ATSChecklistItem] = []
    actionable_advice: List[str] = []

class TailoredResumeResponse(BaseModel):
    success: bool = True
    match_score_before: int = 50
    match_score_after: int = 90
    ats_score: int = 88
    ats_evaluation: ATSEvaluation
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    candidate_name: str = "Candidate Name"
    contact_info: Dict[str, str] = {}
    
    summary: str = ""
    original_summary: Optional[str] = None
    
    skill_groups: List[SkillGroup] = []
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []
    projects: List[ProjectItem] = []
    
    cover_letter: Optional[str] = None
    diff_summary: List[str] = []
    raw_markdown: str = ""
    
    provider_used: str = "Gemini"
    model_used: str = "gemini-1.5-flash"
    is_demo_mode: bool = False

class ExportDocxRequest(BaseModel):
    resume_data: Dict[str, Any]
    filename: Optional[str] = "tailored_resume.docx"

class ExportTxtRequest(BaseModel):
    content: str
    filename: Optional[str] = "tailored_resume.txt"
