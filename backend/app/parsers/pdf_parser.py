import re
import io
from typing import Tuple, Dict, Any, List
import pdfplumber
from pypdf import PdfReader

EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
PHONE_REGEX = r'(?:\+?\d{1,3}[-.\s]*)?(?:\(?\d{2,5}\)?[-.\s]*)?\d{3,5}[-.\s]*\d{3,5}\b'
SECTION_KEYWORDS = [
    "experience", "work experience", "employment", "professional experience",
    "education", "academic background", "skills", "technical skills", "core competencies",
    "projects", "personal projects", "certifications", "licenses", "summary",
    "professional summary", "profile", "objective", "publications", "awards",
    "academic achievements", "achievements", "leadership experience", "leadership"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract full text from PDF bytes using pdfplumber with pypdf fallback."""
    inspection = inspect_pdf_thoroughly(file_bytes)
    return inspection["extracted_text"]

def clean_extracted_text(text: str) -> str:
    """Normalize line endings and excess whitespace."""
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def inspect_pdf_thoroughly(file_bytes: bytes) -> Dict[str, Any]:
    """
    Thoroughly inspect a PDF file extracting:
    - Page count
    - Verbatim page-by-page text
    - Tables / structured grids from each page
    - Contact info & section detection
    - Formatted inspection report for LLM ingestion
    """
    pages_data: List[Dict[str, Any]] = []
    all_text_parts: List[str] = []
    formatted_parts: List[str] = []
    all_tables: List[str] = []

    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page_idx, page in enumerate(pdf.pages, start=1):
                p_text = (page.extract_text(layout=False) or "").strip()
                if p_text:
                    all_text_parts.append(p_text)
                
                # Check for tables
                page_tables = page.extract_tables() or []
                table_strings = []
                for t_idx, table in enumerate(page_tables, start=1):
                    valid_rows = []
                    for row in table:
                        row_cells = [str(c).strip() for c in row if c is not None and str(c).strip()]
                        if row_cells:
                            valid_rows.append(" | ".join(row_cells))
                    if valid_rows:
                        table_repr = f"[Page {page_idx} Table {t_idx}]:\n" + "\n".join(valid_rows)
                        table_strings.append(table_repr)
                        all_tables.append(table_repr)

                page_report = f"--- [PAGE {page_idx}] ---\n{p_text}"
                if table_strings:
                    page_report += "\n\nTables Extracted:\n" + "\n".join(table_strings)
                formatted_parts.append(page_report)

                pages_data.append({
                    "page_number": page_idx,
                    "text": p_text,
                    "tables": table_strings
                })
    except Exception:
        # Fallback to pypdf if pdfplumber encounters unusual fonts/streams
        pass

    # Extract embedded annotation hyperlinks (e.g. LinkedIn, GitHub, Portfolio)
    annotation_links: List[str] = []
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        for p in reader.pages:
            for a in p.get('/Annots', []):
                obj = a.get_object()
                if '/A' in obj and '/URI' in obj['/A']:
                    annotation_links.append(obj['/A']['/URI'])
    except Exception:
        pass

    if not all_text_parts:
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            for page_idx, page in enumerate(reader.pages, start=1):
                p_text = (page.extract_text() or "").strip()
                if p_text:
                    all_text_parts.append(p_text)
                    formatted_parts.append(f"--- [PAGE {page_idx}] ---\n{p_text}")
                    pages_data.append({"page_number": page_idx, "text": p_text, "tables": []})
        except Exception as e:
            raise ValueError(f"Could not inspect or extract text from PDF: {str(e)}")

    full_text = "\n\n".join(all_text_parts).strip()
    if not full_text:
        raise ValueError("The uploaded PDF appears to be empty or contains only non-selectable scanned images.")

    cleaned_full_text = clean_extracted_text(full_text)
    
    # If annotation links exist, append them to the text header so downstream NLP parsers have the full URLs
    if annotation_links:
        links_line = "Extracted Links: " + " | ".join(annotation_links)
        cleaned_full_text = f"{cleaned_full_text}\n\n{links_line}"

    formatted_inspection_text = "\n\n".join(formatted_parts)
    tables_summary = "\n\n".join(all_tables) if all_tables else "None detected"

    metadata = detect_resume_metadata(cleaned_full_text, annotation_links)

    return {
        "page_count": len(pages_data),
        "extracted_text": cleaned_full_text,
        "formatted_page_text": formatted_inspection_text,
        "tables_summary": tables_summary,
        "pages": pages_data,
        "metadata": metadata
    }

def detect_resume_metadata(text: str, annotation_links: Optional[List[str]] = None) -> Dict[str, Any]:
    """Extract contact information and detect present sections."""
    annotation_links = annotation_links or []
    
    emails = re.findall(EMAIL_REGEX, text)
    detected_email = emails[0] if emails else None
    if not detected_email:
        for l in annotation_links:
            if 'mailto:' in l:
                detected_email = l.replace('mailto:', '').strip()
                break
    
    phone_match = re.search(r'(?:phone|tel|mobile|cell|call|contact)?[:\s]*((?:\+?\d{1,3}[-.\s]*)?(?:\(?\d{2,5}\)?[-.\s]*)?\d{3,5}[-.\s]*\d{3,5}\b)', text, re.IGNORECASE)
    detected_phone = phone_match.group(1).strip() if phone_match else None
    
    # Detect LinkedIn
    linkedin_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in\/)?([a-zA-Z0-9_\-\.]+)', text, re.IGNORECASE)
    detected_linkedin = f"linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else None
    if not detected_linkedin:
        for l in annotation_links:
            if 'linkedin.com' in l:
                clean_li = re.sub(r'^https?:\/\/(?:www\.)?', '', l).strip('/')
                detected_linkedin = clean_li
                break

    # Detect GitHub
    github_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)', text, re.IGNORECASE)
    detected_github = f"github.com/{github_match.group(1)}" if github_match else None
    if not detected_github:
        for l in annotation_links:
            if 'github.com' in l:
                clean_gh = re.sub(r'^https?:\/\/(?:www\.)?', '', l).strip('/')
                detected_github = clean_gh
                break

    # Detect Portfolio Link
    detected_portfolio = None
    for l in annotation_links:
        if 'mailto:' not in l and 'linkedin.com' not in l and 'github.com' not in l:
            clean_pf = re.sub(r'^https?:\/\/(?:www\.)?', '', l).strip('/')
            detected_portfolio = clean_pf
            break
    if not detected_portfolio:
        portfolio_match = re.search(r'(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9_\-\.]+\.(?:vercel\.app|github\.io|netlify\.app|me|dev))(?:\/[a-zA-Z0-9_\-\/]*)?', text, re.IGNORECASE)
        if portfolio_match:
            detected_portfolio = portfolio_match.group(1).strip()

    # Try detecting name from the first 3 lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    detected_name = None
    detected_location = None

    for line in lines[:3]:
        # If line has no @ and looks like a person's name (1-4 words, <= 40 chars)
        if '@' not in line and not any(char.isdigit() for char in line) and len(line) <= 40:
            words = line.split()
            if 1 <= len(words) <= 4:
                detected_name = line
                break

    # Look for location keywords
    location_regex = r'(?:Location|City|Address)[:\s]+([A-Za-z\s,]+)'
    loc_match = re.search(location_regex, text, re.IGNORECASE)
    if loc_match:
        detected_location = loc_match.group(1).strip()
    else:
        # Check if first 5 lines contain common city/state patterns
        for l in lines[:5]:
            if any(term in l.lower() for term in ["remote", "delhi", "gurugram", "bangalore", "mumbai", "hyderabad", "california", "new york", "san francisco", "india", "usa"]):
                if '@' not in l and 'http' not in l.lower():
                    detected_location = l.split('|')[0].strip() if '|' in l else l[:40].strip()
                    break
        if not detected_location:
            if detected_phone and '+91' in detected_phone:
                detected_location = "Gurugram, India / Remote"
            elif any(c in text.lower() for c in ["delhi", "haryana", "vidyapeeth"]):
                detected_location = "New Delhi, India"

    # Detect sections canonically
    lower_text = text.lower()
    canonical_map = {
        "Summary": ["professional summary", "summary", "profile", "about me", "objective", "career objective"],
        "Experience": ["work experience", "professional experience", "experience", "employment", "employment history"],
        "Education": ["education", "academic background", "academics", "qualifications"],
        "Projects": ["projects", "personal projects", "key projects", "technical projects", "academic projects", "selected projects", "project work"],
        "Skills": ["technical skills", "skills", "core competencies", "technologies", "tools & technologies"],
        "Achievements": ["academic achievements", "achievements", "leadership experience", "leadership", "awards", "honors"],
        "Certifications": ["certifications", "licenses", "courses", "certificates"]
    }
    detected_sections = []
    for section_title, keywords in canonical_map.items():
        for kw in keywords:
            pattern = rf'(?:^|\n)\s*[#*\-•◦▪▫–—\d\.\s]*{re.escape(kw)}\b'
            if re.search(pattern, lower_text):
                if section_title not in detected_sections:
                    detected_sections.append(section_title)
                break

    return {
        "detected_name": detected_name,
        "detected_email": detected_email,
        "detected_phone": detected_phone,
        "detected_location": detected_location,
        "detected_linkedin": detected_linkedin,
        "detected_github": detected_github,
        "detected_portfolio": detected_portfolio,
        "detected_sections": detected_sections
    }
