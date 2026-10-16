# 📄 CleanLab Resume — Intelligent Resume Customizer & ATS Tailor

An AI-powered full-stack web application that tailors a candidate's resume to match any target Job Description (JD). It extracts real experiences from uploaded PDF or Word documents, highlights matching competencies, rephrases accomplishments using measurable impact formulas, and optimizes formatting for Applicant Tracking Systems (ATS).

---

## 🌟 Architecture & Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend API**: Python 3.11, FastAPI, Uvicorn (OpenAPI docs available at `/docs`)
- **Document Parsers**: `pdfplumber`, `pypdf`, `python-docx`
- **Document Exporter**: `python-docx` (clean Word generator) + native print stylesheet (pixel-perfect 1-page PDF export)
- **Primary AI Engine**: **Groq Cloud API** (`openai/gpt-oss-120b` & `llama-3.3-70b-versatile` for sub-second responses)
- **Alternative AI Engines**: Google Gemini 1.5 Flash, OpenAI (`gpt-4o-mini`)
- **Offline Fallback**: Intelligent heuristic NLP engine that tailors resumes even when offline or without external API keys

---

## 🚀 Key Capabilities

1. **Robust Multi-Page Document Parsing**:
   - Accepts `.pdf`, `.docx`, `.doc`, and `.txt` files up to 10 MB.
   - Extracts candidate contact info (email, phone, location, LinkedIn, GitHub, portfolio) automatically using regex heuristics and PDF link annotations.
   - Accurately identifies key sections (Experience, Projects, Education, Skills, Summary).

2. **Targeted AI Resume Customization**:
   - **Google XYZ Framework**: Rephrases bullets to highlight *Accomplished [X], as measured by [Y], by doing [Z]*.
   - **Competency Grouping**: Dynamically maps candidate skills to competencies demanded by the job description.
   - **Multiple Tailoring Lenses**: Switch between *Impact & Metrics*, *Technical Specialist*, *Executive Leadership*, or *Standard ATS*.
   - **Strict Anti-Hallucination Guardrails**: Prompts explicitly forbid inventing false employers, degrees, or titles. All tailoring builds strictly on candidate's authentic background.

3. **ATS Diagnostics & Match Scoring**:
   - Calculates **Before & After Match Scores** to demonstrate quantifiable alignment.
   - Evaluates overall ATS compliance (0–100) with a categorized checklist covering formatting, action verb density, measurable metrics, and contact completeness.
   - Highlights missing high-value keywords that candidates can realistically incorporate.

4. **Interactive Editing & Exporting**:
   - **Live In-line Editing**: Directly edit any section on the rendered resume paper before exporting.
   - **Version History**: Generate multiple tailored variations with different lenses and switch between them seamlessly.
   - **Visual Diff View**: Side-by-side comparison of original vs. tailored statements with recruiter rationale.
   - **Multi-Format Export**: One-click ATS PDF (via browser print), `.docx` (Microsoft Word), Markdown (`.md`), and Plain Text (`.txt`).
   - **Matching Cover Letter**: Auto-generates a personalized cover letter matching candidate experience to the company and role.

---

## 📦 Setup & Run Instructions

### 1. Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.10+ (Python 3.11 recommended)
- **Git**

### 2. Local Setup (Step-by-Step)

#### Option A: Quickstart Script (Mac / Linux)
```bash
git clone https://github.com/bhaskarpal256/CleanLab.git
cd CleanLab

# Run the automated launch script (starts both backend and frontend)
./start.sh
```

#### Option B: Manual Setup

**Terminal 1 — Backend (FastAPI)**:
```bash
cd CleanLab/backend

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit backend/.env and ensure GROQ_API_KEY is present

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# API runs on http://localhost:8000 (Interactive docs at http://localhost:8000/docs)
```

**Terminal 2 — Frontend (Next.js)**:
```bash
cd CleanLab/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🌐 Production Deployment

### Backend (Render — Free Tier)
1. In the **Render Dashboard**, click **New +** → **Web Service** and select this repo (`CleanLab`).
2. Set configuration:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Under **Environment Variables**, add:
   - `GROQ_API_KEY`: *(your Groq API key)*
   - `GROQ_MODEL`: `openai/gpt-oss-120b`
   - `LLM_PROVIDER`: `groq`
4. Click **Deploy Web Service** and note your public URL (e.g. `https://cleanlab-api.onrender.com`).

### Frontend (Vercel — Free Tier)
1. Import your `CleanLab` repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-name.onrender.com` *(no trailing slash)*
4. Click **Deploy**.

---

## 🤖 AI Tools & Prompt Engineering Notes

### 1. AI Models Used
- **Groq Cloud API (`openai/gpt-oss-120b` & `llama-3.3-70b-versatile`)**:
  - Chosen for near-instant inference speeds (< 1.5 seconds per complete resume customization).
  - High reasoning capability for understanding nuanced technical job descriptions and candidate project impact.
- **Google Gemini 1.5 Flash**:
  - Configured as an optional secondary cloud provider via Google AI Studio.
- **Rule-Based Heuristic NLP Fallback**:
  - If third-party cloud APIs are unreachable, rate-limited, or keys are missing, the system automatically falls back to an offline smart rephrasing engine so the candidate never experiences a broken application.

### 2. Prompt Engineering Strategy
- **Role Persona**: Frames the AI as an elite technical recruiter and certified professional resume writer (CPRW).
- **Google XYZ Formula**: Forces output bullets into quantifiable action statements: *Accomplished [X], as measured by [Y], by doing [Z]*.
- **Strict Pydantic JSON Schema**: Constrains model generation to valid structured JSON with explicit types, eliminating markdown parsing errors.
- **Anti-Hallucination Guardrails**: Prompts explicitly forbid inventing employers, dates, degrees, or certifications that are not substantiated by the candidate's uploaded resume.

---

## 💡 Developer Notes & Engineering Decisions

- **Pure White Paper Styling**: While the UI features a modern dark/light mode toggle with smooth glassmorphic cards, the resume document itself strictly remains pure white with classic typography (`#0f172a`, standard margins). This guarantees that ATS scanners and print previews match real-world executive standard formatting.
- **Zero-Flicker Theme Synchronization**: Theme preference is managed via React's `useSyncExternalStore` and `localStorage`, avoiding layout shifts or cascading re-renders on initial page hydration.
- **Browser Extension Isolation**: Implemented proactive DOM neutralizers and CSS isolation to prevent third-party job extensions (like Careerflow) from injecting unwanted floating overlays into the workspace.
- **Two-Way Deployment Compatibility**: Root deployment files (`render.yaml`, `your_application/wsgi.py`, and `main.py`) support both native Uvicorn and Render's default Gunicorn commands out of the box.

---

## 👥 Author & Repository
* **Repository**: [https://github.com/bhaskarpal256/CleanLab](https://github.com/bhaskarpal256/CleanLab)
* **Author**: Bhaskar Pal
