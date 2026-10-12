# 📄 PrepLab ResumeAI — Intelligent Resume Customizer & ATS Tailor

> Built for the **Full-Stack Developer (AI & Mobile Apps)** assignment at **ThePrepLab (Innovista Labs)**.

An AI-powered web application that takes a Job Description (JD) and a candidate's resume (PDF, DOCX, or text), analyzes key requirements with LLMs, and customizes the resume to maximize ATS match score, keyword alignment, and interview conversion rates.

---

## 🌟 Live Demo & Preview

- **Frontend**: Next.js 16 (React 19, TypeScript, Tailwind CSS)
- **Backend API**: Python 3 (FastAPI, Uvicorn, OpenAPI docs at `/docs`)
- **LLM Engine**: Google Gemini (via Google AI Studio) + Groq/OpenAI compatible fallback + Built-in Smart Demo Engine

---

## 🚀 Key Features

### 1. Core Requirements
- **Job Description Input**: Clean textarea with real-time character/word count, minimum length validation (>= 30 characters), and pre-set role presets.
- **Resume Upload**: Full support for **PDF** and **DOCX** files with drag-and-drop, instant file badge (name, size, type), text extraction, and contact detail detection (email, phone, name).
- **LLM-Powered Customization**:
  - Rewrites the **Summary / Objective** to align with the core target responsibilities.
  - Reorganizes and highlights **Relevant Skills** matching the JD keywords.
  - Reorders and rephrases **Experience Bullets** using active verbs and the Google XYZ impact formula.
  - Identifies **Missing Keywords** with actionable recommendations.
- **Output Display**: Clean ATS document viewer with section copy helpers.
- **Multi-Format Downloads**:
  - **PDF Export**: Print-ready, executive ATS document formatting with 0.75-inch margins.
  - **Microsoft Word (.DOCX)**: Server-generated `.docx` with ATS headers, bullet points, and typography.
  - **Markdown (.md)** & **Plain Text (.txt)**.
- **Error Handling**: Graceful validation of file sizes (<10MB), corrupt documents, short text inputs, and API timeouts.

### 2. Bonus Features Implemented
- 🎯 **Match Score (%)**: Displays before and after match percentages (e.g., 48% ➔ 80%+) with score boost badge.
- 🛡️ **ATS Compliance Score (0-100)**: Evaluates contact information, measurable metric density, active verbs, and standard headings with an itemized checklist.
- 🔀 **Interactive Diff View**: Visual side-by-side / stacked comparison of original vs tailored bullets and summary, including AI rationale.
- 🎛️ **Section-Wise Customization**: Toggle individual sections to customize (Summary, Skills, Experience, Projects).
- 🎭 **Multiple Resume Strategies & Tones**: Choose between *Impact & Metrics*, *Technical Specialist*, *Executive & Ownership*, or *Standard ATS*.
- ✉️ **Role-Tailored Cover Letter Generator**: Generates a professional cover letter matched to the candidate and company with 1-click copy and `.txt` download.
- ⚡ **1-Click Demo Case Loader**: Instantly loads the ThePrepLab Full-Stack Developer JD and sample resume for evaluation in 5 seconds.

---

## 🏗️ Architecture & System Design

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 16 Frontend                       │
│  - Resume Dropzone (PDF / DOCX)                             │
│  - Target Job Description Input + Presets                   │
│  - Customization Settings (Tone, Sections, Cover Letter)    │
│  - ATS Paper Document Preview & In-line Copy                │
│  - Interactive Diff View & ATS Checklist Diagnostics        │
│  - Export Actions (Print PDF, Download DOCX, MD, TXT)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      REST API (JSON / FormData)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Python FastAPI Backend                   │
│  - POST /api/parse-resume  (pdfplumber / python-docx)       │
│  - POST /api/tailor-resume (LLM Orchestration & Prompt)     │
│  - POST /api/export/docx   (python-docx generation)         │
│  - GET  /api/health        (Healthcheck & LLM provider)     │
│  - GET  /api/sample-data   (ThePrepLab Demo Case)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Structured Prompting & JSON Schema
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                     LLM API Provider                        │
│  - Primary: Google Gemini 1.5 Flash (Google AI Studio)      │
│  - Optional: Groq (Llama 3.3) / OpenAI (GPT-4o-mini)        │
│  - Fallback: Built-in Smart Heuristic Engine                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | Server and Client components, modular design |
| **Styling** | Tailwind CSS v4, Lucide React, Canvas Confetti | Executive glassmorphic UI + print ATS stylesheet |
| **Backend** | Python 3.11+, FastAPI, Uvicorn | Async REST API with Pydantic validation |
| **Document Parsers** | `pdfplumber`, `pypdf`, `python-docx` | Robust multi-page PDF & DOCX text extraction |
| **Document Exporter** | `python-docx` | Generates formatted Microsoft Word resumes |
| **AI / LLM** | Google Gemini (`google-generativeai`), Groq, OpenAI | Temperature 0.2, strict JSON schema output |

---

## 📦 Setup & Run Instructions (Local)

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/your-username/ResumeBuilder.git
cd ResumeBuilder
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Open .env and add your GEMINI_API_KEY (optional; app works in demo mode without it)

# Start backend server
python run.py
# Server runs on http://localhost:8000 (OpenAPI docs at http://localhost:8000/docs)
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
```

Open **`http://localhost:3000`** in your browser!

---

## 🐳 Docker Deployment (Optional)

Run the full stack with a single command:
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 🌐 Cloud Deployment Options

### Frontend (Vercel)
1. Push repo to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Set Root Directory to `frontend`.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-url.onrender.com`
5. Deploy!

### Backend (Render / Railway / GCP Cloud Run)
1. Deploy `backend` folder as a Python web service or Docker container.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
4. Set Environment Variables:
   - `GEMINI_API_KEY`: `your_key_here`
   - `PORT`: `8000`

---

## 💡 Prompt Engineering & LLM Design

- **System Instruction**: Enforces the role of an Elite Tech Recruiter and ATS Optimization Architect.
- **Truthful Enhancements**: Explicitly prohibits hallucinating false employers or degrees while applying the **Google XYZ framework** (`Accomplished [X], as measured by [Y], by doing [Z]`).
- **Structured JSON Schema**: Model output is constrained to an exact Pydantic schema, eliminating parsing errors.
- **Dual Verification**: Matches keywords before and after tailoring to measure authentic percentage improvements.

---

## ⚖️ Trade-offs & Known Limitations
- **Scanned Image PDFs**: If a user uploads a PDF that consists purely of scanned raster images without OCR text layer, text extraction requires an OCR library like Tesseract. The current pipeline detects empty extractions and notifies the user with a helpful alert.
- **LLM Rate Limits**: Free tier Google AI Studio keys have rate limits (15 requests/min). The backend includes retry logic and automatically switches to the built-in smart engine if rate limits or network errors occur.

---

## 👥 Author
Submitted for the Full-Stack Developer role at **ThePrepLab / Innovista Labs**.
