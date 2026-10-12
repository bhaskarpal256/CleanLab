import os
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv

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
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "huggingface")  # 'huggingface', 'gemini', 'openai', 'groq', 'auto'
    HUGGINGFACE_MODEL: str = os.getenv("HUGGINGFACE_MODEL", "meta-llama/Llama-3.3-70B-Instruct")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
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
