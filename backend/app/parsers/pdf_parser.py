import re
import io
from typing import Tuple, Dict, Any, List
import pdfplumber
from pypdf import PdfReader

EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
PHONE_REGEX = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
SECTION_KEYWORDS = [
    "experience", "work experience", "employment", "professional experience",
    "education", "academic background", "skills", "technical skills", "core competencies",
    "projects", "personal projects", "certifications", "licenses", "summary",
    "professional summary", "profile", "objective", "publications", "awards"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract full text from PDF bytes using pdfplumber with pypdf fallback."""
    text_content = []
    
    # Try pdfplumber first
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content.append(page_text.strip())
    except Exception:
        # Fallback to pypdf
        pass

    if not text_content or not "".join(text_content).strip():
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content.append(page_text.strip())
        except Exception as e:
            raise ValueError(f"Could not extract text from PDF: {str(e)}")

    full_text = "\n\n".join(text_content).strip()
    if not full_text:
        raise ValueError("The uploaded PDF appears to be empty or contains only non-selectable scanned images.")
        
    return clean_extracted_text(full_text)

def clean_extracted_text(text: str) -> str:
    """Normalize line endings and excess whitespace."""
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def detect_resume_metadata(text: str) -> Dict[str, Any]:
    """Extract contact information and detect present sections."""
    emails = re.findall(EMAIL_REGEX, text)
    detected_email = emails[0] if emails else None
    
    phones = re.findall(PHONE_REGEX, text)
    detected_phone = phones[0] if phones else None
    
    # Try detecting name from the first 3 lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    detected_name = None
    for line in lines[:3]:
        # If line has no @ and looks like a person's name (2-4 words, <= 40 chars)
        if '@' not in line and not any(char.isdigit() for char in line) and len(line) <= 40:
            words = line.split()
            if 1 <= len(words) <= 4:
                detected_name = line
                break

    # Detect sections
    lower_text = text.lower()
    detected_sections = []
    for kw in SECTION_KEYWORDS:
        # Check if keyword appears as a header or separate token
        pattern = rf'(?:^|\n)\s*{re.escape(kw)}\b'
        if re.search(pattern, lower_text):
            title_case = kw.title()
            if title_case not in detected_sections:
                detected_sections.append(title_case)

    return {
        "detected_name": detected_name,
        "detected_email": detected_email,
        "detected_phone": detected_phone,
        "detected_sections": detected_sections
    }
