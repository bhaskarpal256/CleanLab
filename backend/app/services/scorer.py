import re
from typing import List, Set, Dict, Any, Tuple
from ..schemas import ATSEvaluation, ATSChecklistItem

COMMON_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "cannot", "could", "did", "do", "does", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here",
    "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its",
    "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on",
    "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
    "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
    "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
    "until", "up", "very", "was", "wasn't", "we", "were", "what", "when", "where", "which", "while",
    "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves",
    "will", "work", "looking", "role", "team", "years", "experience", "candidate", "responsibilities",
    "requirements", "qualification", "qualifications", "preferred", "must", "plus", "ability", "strong"
}

TECH_KEYWORDS = {
    "python", "javascript", "typescript", "react", "next.js", "node.js", "fastapi", "flask", "django",
    "sql", "postgresql", "mysql", "mongodb", "redis", "azure", "aws", "gcp", "docker", "kubernetes",
    "git", "github", "ci/cd", "rest", "graphql", "tailwind", "css", "html", "vue", "angular", "supabase",
    "firebase", "c++", "c#", "java", "golang", "rust", "linux", "agile", "scrum", "microservices",
    "machine learning", "deep learning", "nlp", "llm", "genai", "prompt engineering", "langchain",
    "llamaindex", "gemini", "openai", "groq", "pytorch", "tensorflow", "pandas", "numpy", "scikit-learn",
    "react native", "flutter", "swift", "kotlin", "ios", "android", "mobile app", "cross-platform"
}

ACTION_VERBS = [
    "spearheaded", "engineered", "developed", "architected", "optimized", "implemented", "delivered",
    "orchestrated", "automated", "designed", "streamlined", "accelerated", "scaled", "reduced",
    "increased", "built", "launched", "mentored", "led", "enhanced", "resolved", "collaborated"
]

def extract_meaningful_tokens(text: str) -> Set[str]:
    """Extract individual keywords and relevant multi-word technical tokens."""
    lower = text.lower()
    tokens = set()
    
    # Check for known tech keywords explicitly
    for kw in TECH_KEYWORDS:
        if kw in lower:
            tokens.add(kw)
            
    # Extract alpha tokens (2 to 25 chars)
    words = re.findall(r'[a-zA-Z]{2,25}', lower)
    for w in words:
        if w not in COMMON_STOPWORDS and len(w) > 2:
            tokens.add(w)
            
    return tokens

def calculate_match_metrics(resume_text: str, jd_text: str) -> Tuple[int, List[str], List[str]]:
    """Compute keyword overlap percentage, matched keywords, and missing keywords."""
    jd_tokens = extract_meaningful_tokens(jd_text)
    resume_tokens = extract_meaningful_tokens(resume_text)
    
    if not jd_tokens:
        return 50, [], []
        
    matched = jd_tokens.intersection(resume_tokens)
    missing = jd_tokens - resume_tokens
    
    # Calculate score
    score = int((len(matched) / max(len(jd_tokens), 1)) * 100)
    score = min(max(score, 15), 98)  # bound between 15% and 98%
    
    # Sort matched and missing by priority (tech keywords first)
    matched_sorted = sorted(list(matched), key=lambda x: (x not in TECH_KEYWORDS, len(x)), reverse=False)[:18]
    missing_sorted = sorted(list(missing), key=lambda x: (x not in TECH_KEYWORDS, len(x)), reverse=False)[:15]
    
    return score, matched_sorted, missing_sorted

def evaluate_ats(resume_text: str, jd_text: str, matched_count: int, missing_count: int) -> ATSEvaluation:
    """Evaluate resume against ATS industry best practices."""
    checklist: List[ATSChecklistItem] = []
    advice: List[str] = []
    
    lower_resume = resume_text.lower()
    
    # 1. Contact Info check
    has_email = bool(re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', resume_text))
    has_phone = bool(re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', resume_text))
    if has_email and has_phone:
        checklist.append(ATSChecklistItem(
            category="Contact Information",
            status="pass",
            message="Both professional email and phone number are clearly present."
        ))
    else:
        checklist.append(ATSChecklistItem(
            category="Contact Information",
            status="warning",
            message="Missing either phone number or email address in header."
        ))
        advice.append("Ensure your full email address and phone number are visible at top of page.")

    # 2. Quantifiable Metrics (e.g. 20%, $50K, 3x, 500k)
    metrics = re.findall(r'(\b\d+%\b|\$\d+[\d,]*[kmbKMB]?|\b\d+x\b|\b\d+\+\b|\b\d+\s*(?:users|clients|projects|ms|seconds|revenue)\b)', resume_text, re.IGNORECASE)
    metrics_score = min(100, int((len(metrics) / 6.0) * 100))
    if len(metrics) >= 4:
        checklist.append(ATSChecklistItem(
            category="Measurable Impact",
            status="pass",
            message=f"Found {len(metrics)} quantifiable impact metrics (%, $, numbers) in bullet points."
        ))
    elif len(metrics) >= 1:
        checklist.append(ATSChecklistItem(
            category="Measurable Impact",
            status="warning",
            message=f"Only found {len(metrics)} quantified metrics. ATS and hiring managers prefer metrics."
        ))
        advice.append("Add measurable outcomes to your bullet points (e.g., 'reduced load time by 35%').")
    else:
        checklist.append(ATSChecklistItem(
            category="Measurable Impact",
            status="fail",
            message="No quantifiable metrics detected. Achievements should follow the Google XYZ formula."
        ))
        advice.append("Include numerical achievements: %, $, revenue, or speed improvements.")

    # 3. Action Verbs check
    found_verbs = [v for v in ACTION_VERBS if re.search(rf'\b{v}\b', lower_resume)]
    verbs_score = min(100, int((len(found_verbs) / 5.0) * 100))
    if len(found_verbs) >= 4:
        checklist.append(ATSChecklistItem(
            category="Strong Action Verbs",
            status="pass",
            message=f"Excellent usage of strong action verbs ({', '.join(found_verbs[:3])}, etc.)."
        ))
    else:
        checklist.append(ATSChecklistItem(
            category="Strong Action Verbs",
            status="warning",
            message="Limited action verbs. Avoid passive phrases like 'responsible for'."
        ))
        advice.append("Start each experience bullet point with an impactful active verb.")

    # 4. Standard Headings check
    standard_sections = ["experience", "education", "skills"]
    found_headings = [h for h in standard_sections if h in lower_resume]
    formatting_score = int((len(found_headings) / 3.0) * 100)
    if len(found_headings) == 3:
        checklist.append(ATSChecklistItem(
            category="Standard Headings",
            status="pass",
            message="Uses standard ATS-recognized section headers (Experience, Skills, Education)."
        ))
    else:
        checklist.append(ATSChecklistItem(
            category="Standard Headings",
            status="warning",
            message=f"Ensure conventional section headers are used (Found: {', '.join(found_headings)})."
        ))
        advice.append("Keep standard section titles so ATS parsers index your data accurately.")

    # 5. Keyword Density
    if matched_count >= 10:
        checklist.append(ATSChecklistItem(
            category="JD Keyword Density",
            status="pass",
            message=f"Strong keyword alignment: {matched_count} matching technical and domain keywords."
        ))
    elif matched_count >= 5:
        checklist.append(ATSChecklistItem(
            category="JD Keyword Density",
            status="warning",
            message=f"Moderate keyword match ({matched_count} keywords matched). Consider adding missing items."
        ))
    else:
        checklist.append(ATSChecklistItem(
            category="JD Keyword Density",
            status="fail",
            message=f"Low keyword overlap ({matched_count} keywords). Tailoring is highly recommended."
        ))

    # Overall calculation
    overall = int((metrics_score * 0.25) + (verbs_score * 0.25) + (formatting_score * 0.25) + (min(100, matched_count * 8) * 0.25))
    overall = max(40, min(98, overall))

    return ATSEvaluation(
        overall_score=overall,
        matched_keywords_count=matched_count,
        missing_keywords_count=missing_count,
        formatting_score=formatting_score,
        action_verbs_score=verbs_score,
        quantifiable_metrics_score=metrics_score,
        checklist=checklist,
        actionable_advice=advice
    )
