import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from ..config import settings
from ..schemas import ParseResumeResponse, TailorResumeRequest, TailoredResumeResponse
from ..parsers.pdf_parser import extract_text_from_pdf, detect_resume_metadata
from ..parsers.docx_parser import extract_text_from_docx
from ..services.llm_service import tailor_resume

router = APIRouter(prefix="/api", tags=["resume"])

SAMPLE_JD = """Role: Full-Stack Developer — AI & Mobile Apps
Company: ThePrepLab (Innovista Labs)
Location: Gurugram, Haryana (Hybrid)

About the Role:
We are looking for an ambitious Full-Stack Developer who can independently own implementation and delivery across our entire product stack — from building clean, ultra-responsive Next.js web applications and mobile apps to designing scalable Python APIs and integrating cutting-edge LLM / AI capabilities.

Responsibilities:
- Build and optimize responsive web applications using Next.js (React App Router), TypeScript, and Tailwind CSS.
- Develop, deploy, and maintain backend microservices and REST APIs using Python (FastAPI / Flask).
- Integrate generative AI / LLM workflows (Gemini, OpenAI, Groq) with prompt engineering, structured JSON parsing, and streaming responses.
- Manage relational and document databases (PostgreSQL, Supabase) and cloud infrastructure (Azure, Docker, CI/CD pipelines).
- Build or contribute to cross-platform mobile applications (React Native / Flutter / Android / iOS).
- Independently own features from conception, database schema design, API implementation, to cloud deployment.

Required Qualifications & Skills:
- 2+ years of full-stack engineering experience with Next.js / React and Python (FastAPI).
- Hands-on experience integrating LLM APIs and prompt engineering for real-world products.
- Strong proficiency with PostgreSQL, Supabase, and cloud services (Azure or GCP).
- Experience with containerization (Docker) and Git-based CI/CD workflows.
- Previous hands-on experience developing and publishing mobile applications.
- Strong problem-solving abilities, self-starter mentality, and commitment to clean, well-tested code."""

SAMPLE_RESUME = """Bhaskar Sharma
Email: bhaskar.sharma@example.com | Phone: +91 98765 43210
Location: New Delhi, India | LinkedIn: linkedin.com/in/bhaskar-dev | GitHub: github.com/bhaskar-sharma

PROFESSIONAL SUMMARY
Full-Stack Software Engineer with 3+ years of experience designing scalable web and mobile software. Proficient in React, Python, TypeScript, and modern API architectures. Experienced in building AI-assisted developer tools and database optimizations.

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript, SQL, HTML5, CSS3
Frameworks & Libraries: Next.js, React, FastAPI, Node.js, Express, React Native, Tailwind CSS
Databases & Cloud: PostgreSQL, Supabase, MongoDB, Azure, Docker, Git, CI/CD
AI & Tooling: OpenAI API, Gemini API, Prompt Engineering, Vector Embeddings, LangChain

WORK EXPERIENCE
Full-Stack Engineer | Nexus Technologies, Gurugram
July 2023 - Present
- Developed customer-facing web dashboards using Next.js and TypeScript, improving page load speeds by 35%.
- Built RESTful backend microservices in Python FastAPI with automated validation and JWT authentication.
- Integrated LLM APIs to automate customer query classification and summarization, handling 15,000+ requests daily.
- Optimized database indexing and SQL queries in PostgreSQL, reducing average query execution times by 40%.
- Created automated Docker deployment pipelines and monitored services on Azure App Service.

Software Developer | AppWorks Studio, Noida
August 2021 - June 2023
- Built responsive UI components for cross-platform mobile apps using React Native, achieving 4.6-star ratings on Google Play Store.
- Designed database schemas and managed user authentication with Supabase and Firebase.
- Collaborated in a 6-person Agile engineering team following bi-weekly sprint cadences and rigorous code reviews.
- Authored comprehensive unit and integration tests, elevating codebase test coverage from 60% to 88%.

PROJECTS
AI Document Assistant
- Built a web application using Next.js (App Router), FastAPI, and Google Gemini API to analyze PDF reports and generate executive summaries.
- Implemented real-time token streaming and document parsing using Python pdfplumber.

Mobile Fitness & Habit Tracker (React Native & Supabase)
- Engineered an offline-first cross-platform mobile application published on Android.
- Integrated background task sync and PostgreSQL row-level security for 10,000+ active users.

EDUCATION
Bachelor of Technology (B.Tech) in Computer Science & Engineering
Delhi Technological University (DTU), 2021
GPA: 8.6 / 10"""

@router.post("/parse-resume", response_model=ParseResumeResponse)
async def parse_resume_file(file: UploadFile = File(...)):
    """Parse an uploaded PDF or DOCX resume and extract text content."""
    filename = file.filename or "uploaded_resume"
    extension = os.path.splitext(filename)[1].lower()
    
    if extension not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{extension}'. Please upload a PDF (.pdf) or Word document (.docx)."
        )
        
    file_bytes = await file.read()
    file_size_bytes = len(file_bytes)
    
    if file_size_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty. Please select a valid resume document."
        )
        
    if file_size_bytes > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )

    # Format file size string (KB / MB)
    if file_size_bytes < 1024 * 1024:
        file_size_formatted = f"{file_size_bytes / 1024:.1f} KB"
    else:
        file_size_formatted = f"{file_size_bytes / (1024 * 1024):.2f} MB"

    # Extract text based on file format
    try:
        if extension == ".pdf":
            extracted_text = extract_text_from_pdf(file_bytes)
        elif extension in [".docx", ".doc"]:
            extracted_text = extract_text_from_docx(file_bytes)
        else: # .txt
            extracted_text = file_bytes.decode("utf-8", errors="ignore").strip()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error parsing resume content: {str(e)}"
        )

    # Analyze metadata
    metadata = detect_resume_metadata(extracted_text)
    words = extracted_text.split()

    return ParseResumeResponse(
        filename=filename,
        file_size_bytes=file_size_bytes,
        file_size_formatted=file_size_formatted,
        file_type=extension.upper().replace(".", ""),
        character_count=len(extracted_text),
        word_count=len(words),
        extracted_text=extracted_text,
        detected_name=metadata.get("detected_name"),
        detected_email=metadata.get("detected_email"),
        detected_phone=metadata.get("detected_phone"),
        sections_detected=metadata.get("detected_sections", [])
    )

@router.post("/tailor-resume", response_model=TailoredResumeResponse)
async def tailor_resume_endpoint(request: TailorResumeRequest):
    """Analyze Job Description and customize resume content using LLM."""
    if len(request.job_description.strip()) < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job Description is too short. Please paste a complete job description (minimum 30 characters)."
        )
        
    if len(request.resume_text.strip()) < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume content is too short. Please upload a valid resume or paste the complete text."
        )

    try:
        result = await tailor_resume(
            resume_text=request.resume_text,
            jd_text=request.job_description,
            candidate_name=request.candidate_name,
            candidate_email=request.candidate_email,
            candidate_phone=request.candidate_phone,
            options=request.options
        )
        return TailoredResumeResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to tailor resume: {str(e)}"
        )

@router.get("/sample-data")
def get_sample_data():
    """Provides high-quality sample Job Description and sample resume for instant 1-click evaluation."""
    return {
        "job_description": SAMPLE_JD,
        "resume_text": SAMPLE_RESUME,
        "role_title": "Full-Stack Developer (AI & Mobile Apps)",
        "company": "ThePrepLab / Innovista Labs"
    }
