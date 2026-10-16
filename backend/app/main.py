from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import time

from .config import settings
from .routers import resume, export

app = FastAPI(
    title="Resume Customizer AI API",
    description="High-performance backend API for parsing resumes, intelligent LLM tailoring against Job Descriptions, and ATS optimization.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume.router)
app.include_router(export.router)

START_TIME = time.time()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "message": "AI Resume Customizer Backend is operational"
    }

@app.get("/api/health")
def health_check():
    groq_configured = bool(settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY"))
    openai_configured = bool(settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY"))
    gemini_configured = bool(settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY"))
    
    active_engine = "Groq" if groq_configured else ("OpenAI" if openai_configured else ("Gemini" if gemini_configured else "Smart Built-in Engine"))
    
    return {
        "status": "healthy",
        "uptime_seconds": int(time.time() - START_TIME),
        "llm_engine": active_engine,
        "providers": {
            "groq": groq_configured,
            "openai": openai_configured,
            "gemini": gemini_configured,
        },
        "models": {
            "groq_model": settings.GROQ_MODEL,
            "openai_model": settings.OPENAI_MODEL,
            "gemini_model": settings.GEMINI_MODEL,
        }
    }

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )
