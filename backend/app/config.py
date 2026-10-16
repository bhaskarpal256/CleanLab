import os
from pathlib import Path
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv

# Search for .env in current directory, backend directory, and project root
_curr_dir = Path(__file__).resolve().parent # /backend/app
_backend_dir = _curr_dir.parent # /backend
_root_dir = _backend_dir.parent # /ResumeBuilder

for _candidate in [_backend_dir / ".env", _root_dir / ".env", Path(".env")]:
    if _candidate.is_file():
        load_dotenv(dotenv_path=_candidate)
        break
else:
    load_dotenv()


class Settings(BaseModel):
    PROJECT_NAME: str = "Resume Customizer AI API"
    VERSION: str = "1.0.0"
    
    # LLM Settings
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "") or os.getenv("HF_TOKEN", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # Default model options
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")  # 'groq', 'openai', 'gemini', 'auto'
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Upload limits
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    MAX_FILE_SIZE_BYTES: int = int(os.getenv("MAX_FILE_SIZE_MB", "10")) * 1024 * 1024
    
    # Allowed CORS Origins
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://localhost:3000",
        "*"
    ]

settings = Settings()
