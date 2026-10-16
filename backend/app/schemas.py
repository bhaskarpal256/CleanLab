from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

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
    detected_location: Optional[str] = None
    detected_linkedin: Optional[str] = None
    detected_github: Optional[str] = None
    detected_portfolio: Optional[str] = None
    detected_achievements: List[str] = []
    detected_projects: List[str] = []
    page_count: Optional[int] = 1
    has_tables: bool = False
    sections_detected: List[str] = []
    initial_ats_score: Optional[int] = None
    ats_evaluation: Optional[ATSEvaluation] = None

class CustomizationOptions(BaseModel):
    target_role: Optional[str] = None
    target_company: Optional[str] = None
    seniority_level: Optional[str] = Field(default=None, description="e.g. 'Entry-Level', 'Mid-Level', 'Senior', 'Lead'")
    key_skills_to_emphasize: Optional[str] = Field(default=None, description="Specific tech stack to highlight")
    tone: str = Field(default="impact_metrics", description="Options: 'impact_metrics', 'balanced', 'technical', 'executive'")
    sections_to_customize: List[str] = Field(
        default=["summary", "skills", "experience", "projects"],
        description="Sections selected for customization"
    )
    generate_cover_letter: bool = True
    custom_instructions: Optional[str] = Field(default=None, description="Custom criteria, focus areas, or instructions for LLM")
    candidate_location: Optional[str] = None
    candidate_linkedin: Optional[str] = None
    candidate_github: Optional[str] = None
    candidate_portfolio: Optional[str] = None
    hf_token: Optional[str] = Field(default=None, description="Hugging Face User Access Token (hf_...)")
    hf_model: Optional[str] = Field(default=None, description="Hugging Face Model ID")
    gemini_api_key: Optional[str] = Field(default=None, description="Optional Gemini API key")
    groq_api_key: Optional[str] = Field(default=None, description="Optional Groq API key")
    iteration_seed: Optional[int] = Field(default=None, description="Seed or counter for producing varied AI outputs on each run")
    variation_angle: Optional[str] = Field(default=None, description="Specific strategic lens or variation focus (e.g. 'Performance & Scale', 'Product & UX')")

class TailorResumeRequest(BaseModel):
    resume_text: str = Field(..., min_length=30, description="Extracted text from resume")
    job_description: str = Field(..., min_length=30, description="Job description text")
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None
    candidate_location: Optional[str] = None
    candidate_linkedin: Optional[str] = None
    candidate_github: Optional[str] = None
    candidate_portfolio: Optional[str] = None
    candidate_links: Optional[List[str]] = []
    pdf_base64: Optional[str] = Field(default=None, description="Raw base64-encoded PDF document for direct LLM multimodal inspection")
    pdf_filename: Optional[str] = Field(default=None, description="Original filename of the uploaded PDF")
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
    achievements: List[str] = []
    
    cover_letter: Optional[str] = None
    diff_summary: List[str] = []
    raw_markdown: str = ""
    
    provider_used: str = "Gemini"
    model_used: str = "gemini-1.5-flash"
    is_demo_mode: bool = False
    api_error_message: Optional[str] = None
    api_warning: Optional[str] = None
    tailoring_lens: Optional[str] = None

class ExportDocxRequest(BaseModel):
    resume_data: Dict[str, Any]
    filename: Optional[str] = "tailored_resume.docx"

class ExportTxtRequest(BaseModel):
    content: str
    filename: Optional[str] = "tailored_resume.txt"
