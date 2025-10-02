import os
import random
import logging
import json
import time
from datetime import datetime, date, timezone
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
import requests

from . import models
from .config import settings

# LLM Configuration
OLLAMA_API = os.getenv("OLLAMA_API", "http://localhost:11434/api/generate")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b")

# Ensure directories
os.makedirs(getattr(settings, "UPLOAD_DIR", "uploads"), exist_ok=True)
os.makedirs("logs", exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO if not getattr(settings, "DEBUG", False) else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/app.log"),
        logging.StreamHandler()
    ],
)
logger = logging.getLogger("resume_app.utils")

# Constants from settings
MAX_MONTHLY = getattr(settings, "MAX_MONTHLY_SCANS", 5)
ALLOWED_EXTENSIONS = getattr(settings, "ALLOWED_EXTENSIONS", [".pdf", ".docx"])
UPLOAD_DIR = getattr(settings, "UPLOAD_DIR", "uploads")

# Attempt optional imports for file parsing
try:
    import PyPDF2
except Exception:
    PyPDF2 = None

try:
    import docx
except Exception:
    docx = None

def call_llm(prompt: str, model: str = DEFAULT_MODEL, stream: bool = False, temperature: float = 0.2, num_predict: int = 512) -> str:
    """Calls the Ollama LLM API running on localhost and returns the response text."""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": stream,
        "options": {
            "temperature": temperature,
            "num_predict": num_predict
        }
    }
    try:
        logger.info(f"Calling LLM with model: {model}")
        response = requests.post(OLLAMA_API, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json().get("response", "")
        logger.info(f"LLM response length: {len(result)}")
        return result.strip()
    except requests.exceptions.Timeout:
        logger.error("LLM request timed out")
        return ""
    except requests.exceptions.ConnectionError:
        logger.error("Cannot connect to Ollama server")
        return ""
    except Exception as e:
        logger.error(f"Error calling Ollama LLM: {e}")
        return ""

def check_and_reset_quota(db: Session, user: models.User) -> int:
    """Check and reset monthly quota if needed."""
    # Special case: unlimited scans for nadeemali001@gmail.com
    if getattr(user, "email", "") == "nadeemali001@gmail.com":
        logger.debug("User %s has unlimited scans", getattr(user, "email", "<unknown>"))
        return 999999  # Return a very high number to indicate unlimited
    
    today = date.today()
    last = user.last_quota_reset
    if last is None:
        user.last_quota_reset = datetime.now(timezone.utc)
        user.scan_count = 0
        db.commit()
    else:
        try:
            if last.month != today.month or last.year != today.year:
                user.scan_count = 0
                user.last_quota_reset = datetime.now(timezone.utc)
                db.commit()
        except Exception:
            user.scan_count = 0
            user.last_quota_reset = datetime.now(timezone.utc)
            db.commit()
    remaining = MAX_MONTHLY - (user.scan_count or 0)
    logger.debug("User %s remaining scans: %d", getattr(user, "email", "<unknown>"), remaining)
    return max(0, remaining)

def consume_quota(db: Session, user: models.User):
    """Consume one scan from user's quota."""
    # Special case: don't consume quota for nadeemali001@gmail.com
    if getattr(user, "email", "") == "nadeemali001@gmail.com":
        logger.debug("User %s has unlimited scans, not consuming quota", getattr(user, "email", "<unknown>"))
        return
    
    user.scan_count = (user.scan_count or 0) + 1
    db.commit()
    logger.debug("Consumed quota for user %s, new count=%s", getattr(user, "email", "<unknown>"), user.scan_count)

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    if not filename:
        return False
    lower = filename.lower()
    return any(lower.endswith(ext) for ext in ALLOWED_EXTENSIONS)

def _extract_text_from_pdf(path: str) -> str:
    """Extract text from PDF file."""
    if not PyPDF2:
        logger.debug("PyPDF2 not available for PDF extraction")
        return ""
    try:
        text_parts = []
        with open(path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for p in reader.pages:
                text_parts.append(p.extract_text() or "")
        return "\n".join(text_parts)
    except Exception as e:
        logger.exception("Error extracting PDF text: %s", e)
        return ""

def _extract_text_from_docx(path: str) -> str:
    """Extract text from DOCX file."""
    if not docx:
        logger.debug("python-docx not available for DOCX extraction")
        return ""
    try:
        doc = docx.Document(path)
        paragraphs = [p.text for p in doc.paragraphs if p.text]
        return "\n".join(paragraphs)
    except Exception as e:
        logger.exception("Error extracting DOCX text: %s", e)
        return ""

def extract_text_from_file(path: str) -> str:
    """Extract text from file based on extension."""
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        return _extract_text_from_pdf(path)
    if ext == ".docx":
        return _extract_text_from_docx(path)
    return ""

def _parse_json_or_fallback(text: str) -> Optional[Dict[str, Any]]:
    """Robustly extract a JSON object from LLM output."""
    if not text:
        return None
    import re, ast

    logger.debug("LLM raw output (truncated): %s", (text or "")[:4000])

    # 1) direct strict JSON
    try:
        return json.loads(text)
    except Exception:
        pass

    # 2) fenced ```json``` block (preferred)
    try:
        m = re.search(r"```json\s*(\{.*?\})\s*```", text, flags=re.IGNORECASE | re.DOTALL)
        if m:
            candidate = m.group(1)
            candidate = re.sub(r",\s*([}\]])", r"\1", candidate)
            try:
                return json.loads(candidate)
            except Exception:
                try:
                    return json.loads(candidate.replace("'", '"'))
                except Exception:
                    try:
                        return ast.literal_eval(candidate)
                    except Exception:
                        logger.debug("Failed to parse fenced JSON", exc_info=True)
    except Exception:
        logger.debug("Error searching for fenced JSON", exc_info=True)

    # 3) first {...} block fallback
    try:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            snippet = text[start : end + 1]
            snippet = re.sub(r",\s*([}\]])", r"\1", snippet)
            try:
                return json.loads(snippet)
            except Exception:
                try:
                    return json.loads(snippet.replace("'", '"'))
                except Exception:
                    try:
                        return ast.literal_eval(snippet)
                    except Exception:
                        logger.debug("Failed to parse extracted {...} snippet", exc_info=True)
    except Exception:
        logger.debug("Error extracting {...} fallback", exc_info=True)

    return None

def process_resume_file(path: str) -> dict:
    """Process resume file and return analysis results."""
    resume_text = extract_text_from_file(path)
    if not resume_text:
        resume_text = f"[Could not extract text from file. Filename: {os.path.basename(path)}]"

    # Try LLM analysis
    try:
        prompt = f"""
You are an expert resume reviewer. Given the resume text below, produce a JSON object exactly with these keys:
- score: integer 0-100 (ATS-style score)
- strengths: list of 1-5 short strings
- weaknesses: list of 1-5 short strings
- suggestions: list of 3-6 short actionable suggestions

Resume filename: {os.path.basename(path)}

Resume text:
\"\"\"{resume_text}\"\"\"

Return only valid JSON. Do not add any explanatory text.
"""
        raw = call_llm(prompt)
        logger.info("LLM raw (first 2000 chars): %s", (raw or "")[:2000])
        parsed = _parse_json_or_fallback(raw)
        if parsed:
            score = int(parsed.get("score", 0))
            strengths = parsed.get("strengths") or []
            weaknesses = parsed.get("weaknesses") or []
            suggestions = parsed.get("suggestions") or []
            feedback = "Suggestions: " + "; ".join(suggestions) if suggestions else parsed.get("feedback", "")
            logger.info("LLM analysis success for %s (score=%s)", path, score)
            return {
                "score": score,
                "feedback": feedback or "",
                "strengths": strengths,
                "weaknesses": weaknesses,
                "suggestions": suggestions,
                "raw": parsed,
            }
        else:
            logger.warning("LLM returned unparsable output, falling back to mock")
    except Exception as e:
        logger.exception("LLM analysis failed, falling back to mock: %s", e)

    # Fallback mock analysis
    score = random.randint(35, 90)
    feedback = "Mock feedback: emphasize achievements, quantify results, and add relevant keywords."
    strengths = ["Clear formatting", "Relevant experience"] if random.random() > 0.5 else ["Concise summary"]
    weaknesses = ["Missing metrics", "Weak keywords"] if random.random() > 0.5 else ["Too generic summary"]
    suggestions = [
        "Quantify achievements with numbers",
        "Add specific keywords from job descriptions",
        "List measurable results for major projects"
    ]
    logger.info("Mock analysis used for %s (score=%s)", path, score)
    return {
        "score": score,
        "feedback": feedback,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
    }

def analyze_resume_vs_jd(resume_content: str, jd_content: str, resume_name: str, jd_title: str) -> dict:
    """Analyze resume vs job description using LLM."""
    prompt = f"""Analyze this resume against the job description and return ONLY a valid JSON object with these exact fields:

{{
  "match_score": 75,
  "ats_score": 80,
  "strengths": ["Strong technical background in Python", "Relevant project experience"],
  "weaknesses": ["Missing cloud experience", "Limited leadership examples"],
  "improvements": ["Add AWS certifications", "Quantify achievements with numbers"],
  "matched_keywords": ["Python", "SQL", "Agile"],
  "missing_keywords": ["AWS", "Docker", "Kubernetes"],
  "experience_match": "Good match for mid-level position",
  "skills_alignment": 70,
  "recommendation": "Strong candidate with room for improvement",
  "resume_name": "{resume_name}",
  "jd_title": "{jd_title}"
}}

Resume: {resume_content[:2000]}

Job Description: {jd_content[:2000]}

Return ONLY the JSON object. No markdown, no explanations, no code blocks."""
    raw = call_llm(prompt)
    try:
        # Clean the response to extract JSON
        raw_clean = raw.strip()
        
        # Remove markdown code blocks if present
        if raw_clean.startswith('```json'):
            raw_clean = raw_clean[7:]
        if raw_clean.startswith('```'):
            raw_clean = raw_clean[3:]
        if raw_clean.endswith('```'):
            raw_clean = raw_clean[:-3]
        
        # Remove backticks if present
        raw_clean = raw_clean.strip('`')
        
        # Try to find JSON object in the response
        if raw_clean.startswith('{') and raw_clean.endswith('}'):
            json_str = raw_clean
        else:
            # Look for JSON object within the response
            start_idx = raw_clean.find('{')
            end_idx = raw_clean.rfind('}')
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                json_str = raw_clean[start_idx:end_idx+1]
            else:
                raise ValueError("No valid JSON found in response")
        
        data = json.loads(json_str)
        # Ensure all expected keys are present for template safety
        expected_keys = [
            "match_score", "ats_score", "strengths", "weaknesses", "improvements",
            "matched_keywords", "missing_keywords", "experience_match",
            "skills_alignment", "recommendation", "resume_name", "jd_title"
        ]
        for key in expected_keys:
            if key not in data:
                if key in ["strengths", "weaknesses", "improvements", "matched_keywords", "missing_keywords"]:
                    data[key] = []
                else:
                    data[key] = "" if key not in ["match_score", "ats_score", "skills_alignment"] else 0
        
        # Ensure we have at least some content in each list
        if not data.get("strengths"):
            data["strengths"] = ["Resume shows relevant experience", "Clear professional formatting"]
        if not data.get("weaknesses"):
            data["weaknesses"] = ["Could benefit from more specific achievements", "Missing some key industry keywords"]
        if not data.get("improvements"):
            data["improvements"] = ["Quantify achievements with specific numbers", "Add more industry-specific keywords", "Include measurable results"]
        
        return data
    except Exception as e:
        logger.warning(f"Error parsing LLM output: {e}\nRaw output: {raw[:500]}...")
        # Enhanced fallback mock
        return {
            "match_score": random.randint(45, 95),
            "ats_score": random.randint(40, 90),
            "strengths": [
                "Resume demonstrates relevant technical experience in the field",
                "Clear and professional formatting that's easy to read",
                "Shows progression in career with increasing responsibilities"
            ],
            "weaknesses": [
                "Missing specific metrics and quantifiable achievements",
                "Could benefit from more industry-specific keywords",
                "Limited examples of leadership or project management experience"
            ],
            "improvements": [
                "Add specific numbers and percentages to quantify achievements (e.g., 'increased sales by 25%')",
                "Include more keywords from the job description throughout the resume",
                "Add a summary section highlighting key qualifications",
                "Include examples of problem-solving and leadership experience"
            ],
            "matched_keywords": ["python", "sql", "project management", "data analysis", "team collaboration"],
            "missing_keywords": ["aws", "machine learning", "agile methodology", "cloud computing"],
            "experience_match": "Mid-level professional with 3-5 years of relevant experience",
            "skills_alignment": random.randint(60, 95),
            "recommendation": "Good overall fit with room for improvement. Focus on adding specific metrics and missing technical skills to increase match score.",
            "resume_name": resume_name,
            "jd_title": jd_title,
        }

def generate_cover_letter(resume_content: str, jd_content: str, jd_title: str, jd_company: str, 
                         your_name: str, your_email: str, your_phone: str = "", 
                         include_achievements: bool = False, emphasize_skills: bool = False,
                         add_passion: bool = False, professional_tone: bool = False, **kwargs) -> dict:
    """Generate a cover letter using LLM."""
    
    # Build customization instructions based on options
    customization_instructions = []
    if include_achievements:
        customization_instructions.append("- Emphasize specific achievements and quantifiable results")
    if emphasize_skills:
        customization_instructions.append("- Highlight relevant technical and soft skills")
    if add_passion:
        customization_instructions.append("- Show genuine enthusiasm and passion for the role")
    if professional_tone:
        customization_instructions.append("- Use a formal, professional tone throughout")
    
    customization_text = "\n".join(customization_instructions) if customization_instructions else ""
    
    prompt = f"""
Write a professional cover letter for the following job application.

Applicant Name: {your_name}
Applicant Email: {your_email}
Applicant Phone: {your_phone}

Job Title: {jd_title}
Company: {jd_company}

Job Description:
{jd_content}

Resume Content:
{resume_content}

IMPORTANT INSTRUCTIONS:
- Do NOT include "Dear Hiring Manager," or any greeting - this will be added by the template
- Do NOT include "Sincerely," or any closing - this will be added by the template
- Do NOT include any introductory text like "Here's a professional cover letter for..."
- Start directly with the first paragraph of the cover letter body
- End with the last paragraph before the closing
- Write 3-4 paragraphs that highlight relevant experience and show enthusiasm for the role
- Make it tailored to the specific job and company
- Be professional and engaging

{customization_text}

Return ONLY the cover letter body paragraphs separated by two newlines. Each paragraph should be a complete thought.
"""
    try:
        raw = call_llm(prompt)
        
        # Clean up the response
        raw_clean = raw.strip()
        
        # Remove common unwanted phrases
        unwanted_phrases = [
            "Here's a professional cover letter for",
            "Here is a professional cover letter for",
            "Here is the cover letter body:",
            "Here's the cover letter body:",
            "Dear Hiring Manager,",
            "Sincerely,",
            "Best regards,",
            "Thank you for your consideration."
        ]
        
        for phrase in unwanted_phrases:
            if raw_clean.startswith(phrase):
                raw_clean = raw_clean[len(phrase):].strip()
            # Also check if it's in the first paragraph
            if phrase in raw_clean:
                raw_clean = raw_clean.replace(phrase, "").strip()
        
        paragraphs = [p.strip() for p in raw_clean.split("\n\n") if p.strip()]
        
        # Clean up each paragraph
        cleaned_paragraphs = []
        for paragraph in paragraphs:
            # Remove unwanted phrases from each paragraph
            clean_paragraph = paragraph
            for phrase in unwanted_phrases:
                clean_paragraph = clean_paragraph.replace(phrase, "").strip()
            if clean_paragraph:  # Only add non-empty paragraphs
                cleaned_paragraphs.append(clean_paragraph)
        
        if not cleaned_paragraphs:
            raise ValueError("LLM returned empty output")
        
        return {
            "paragraphs": cleaned_paragraphs,
            "your_name": your_name,
            "your_email": your_email,
            "your_phone": your_phone
        }
    except Exception as e:
        logger.warning(f"LLM cover letter generation failed, using mock. Error: {e}")
        # Fallback mock
        return {
            "paragraphs": [
                f"I am excited to apply for the {jd_title} position at {jd_company}. My background in software engineering and passion for technology make me an ideal candidate for this role.",
                f"With my experience in developing scalable applications and working with cross-functional teams, I am confident that I can contribute significantly to your team's success.",
                "I would welcome the opportunity to discuss how my skills and enthusiasm can benefit {jd_company}. Thank you for considering my application."
            ],
            "your_name": your_name,
            "your_email": your_email,
            "your_phone": your_phone
        }

def analyze_resume_improvements(resume_content: str, improvement_type: str, resume_name: str) -> dict:
    """Analyze resume improvements using LLM with specific, actionable suggestions."""
    
    if improvement_type == "keywords":
        prompt = f"""Analyze this resume and provide specific ATS keyword improvements. Return ONLY a valid JSON object:

{{
  "missing_keywords": ["specific technical terms", "industry buzzwords", "software names"],
  "keyword_suggestions": [
    {{
      "category": "Technical Skills",
      "missing": ["Python", "AWS", "Docker"],
      "reason": "These are high-demand skills in the field"
    }},
    {{
      "category": "Industry Terms", 
      "missing": ["Agile", "DevOps", "CI/CD"],
      "reason": "Common in job descriptions"
    }}
  ],
  "ats_score_impact": "Adding these keywords could increase ATS score by 15-25 points"
}}

Resume: {resume_content[:2000]}

Return ONLY the JSON object. No markdown, no explanations, no code blocks."""

    elif improvement_type == "role":
        prompt = f"""Analyze this resume for role-specific improvements. Return ONLY a valid JSON object:

{{
  "missing_metrics": ["specific numbers", "percentages", "quantified achievements"],
  "role_suggestions": [
    {{
      "section": "Experience",
      "improvement": "Add specific metrics like 'increased sales by 25%' or 'managed team of 8 people'",
      "example": "Instead of 'improved performance', write 'improved performance by 30%'"
    }},
    {{
      "section": "Skills",
      "improvement": "Add proficiency levels and years of experience",
      "example": "Python (5 years), Advanced Excel (Expert level)"
    }}
  ],
  "achievement_suggestions": ["specific accomplishments with numbers", "project outcomes", "business impact"]
}}

Resume: {resume_content[:2000]}

Return ONLY the JSON object. No markdown, no explanations, no code blocks."""

    elif improvement_type == "grammar":
        prompt = f"""Analyze this resume for grammar, style, and formatting improvements. Return ONLY a valid JSON object:

{{
  "grammar_issues": ["specific grammar mistakes found", "tense inconsistencies", "punctuation errors"],
  "style_suggestions": [
    {{
      "issue": "Inconsistent verb tense",
      "fix": "Use past tense for previous roles, present tense for current role",
      "example": "Change 'I manage' to 'I managed' for past positions"
    }},
    {{
      "issue": "Weak action verbs",
      "fix": "Replace weak verbs with strong action words",
      "example": "Change 'did' to 'implemented', 'made' to 'developed'"
    }}
  ],
  "formatting_issues": ["inconsistent bullet points", "spacing problems", "font inconsistencies"],
  "clarity_suggestions": ["unclear sentences", "jargon without explanation", "run-on sentences"]
}}

Resume: {resume_content[:2000]}

Return ONLY the JSON object. No markdown, no explanations, no code blocks."""

    else:  # comprehensive
        prompt = f"""Provide a comprehensive resume analysis with specific, actionable improvements. Return ONLY a valid JSON object:

{{
  "overall_score": 75,
  "strengths": ["specific strong points found in resume"],
  "critical_issues": ["major problems that need immediate attention"],
  "keyword_analysis": {{
    "missing_essential": ["critical keywords missing"],
    "overused": ["words used too frequently"],
    "suggested_additions": ["specific keywords to add"]
  }},
  "content_improvements": [
    {{
      "section": "Professional Summary",
      "current_issue": "Too generic or missing",
      "suggestion": "Add 2-3 specific achievements with metrics",
      "example": "Results-driven Software Engineer with 5+ years developing scalable web applications, increasing system performance by 40%"
    }},
    {{
      "section": "Work Experience", 
      "current_issue": "Lacks specific achievements",
      "suggestion": "Add quantified results for each role",
      "example": "Led team of 5 developers, reducing deployment time by 50%"
    }}
  ],
  "ats_optimization": [
    "Add more industry-specific keywords",
    "Include relevant certifications",
    "Use standard section headers"
  ],
  "priority_actions": [
    "Add 5-7 specific metrics to work experience",
    "Include 3-5 missing technical skills",
    "Rewrite professional summary with achievements"
  ]
}}

Resume: {resume_content[:2000]}

Return ONLY the JSON object. No markdown, no explanations, no code blocks."""
    try:
        raw = call_llm(prompt)
        
        # Clean the response to extract JSON
        raw_clean = raw.strip()
        
        # Remove markdown code blocks if present
        if raw_clean.startswith('```json'):
            raw_clean = raw_clean[7:]
        if raw_clean.startswith('```'):
            raw_clean = raw_clean[3:]
        if raw_clean.endswith('```'):
            raw_clean = raw_clean[:-3]
        
        # Remove backticks if present
        raw_clean = raw_clean.strip('`')
        
        # Try to find JSON object in the response
        if raw_clean.startswith('{') and raw_clean.endswith('}'):
            json_str = raw_clean
        else:
            # Look for JSON object within the response
            start_idx = raw_clean.find('{')
            end_idx = raw_clean.rfind('}')
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                json_str = raw_clean[start_idx:end_idx+1]
            else:
                raise ValueError("No valid JSON found in response")
        
        data = json.loads(json_str)
        
        # Map improvement types to titles
        type_titles = {
            "keywords": "ATS Keyword Enhancement",
            "role": "Role Alignment & Metrics",
            "grammar": "Grammar & Style",
            "comprehensive": "Comprehensive Analysis"
        }
        
        # Process different improvement types
        if improvement_type == "keywords":
            return {
                "resume_name": resume_name,
                "improvement_type": improvement_type,
                "improvement_type_title": type_titles.get(improvement_type, improvement_type.title()),
                "missing_keywords": data.get("missing_keywords", []),
                "keyword_suggestions": data.get("keyword_suggestions", []),
                "ats_score_impact": data.get("ats_score_impact", ""),
            }
        
        elif improvement_type == "role":
            return {
                "resume_name": resume_name,
                "improvement_type": improvement_type,
                "improvement_type_title": type_titles.get(improvement_type, improvement_type.title()),
                "missing_metrics": data.get("missing_metrics", []),
                "role_suggestions": data.get("role_suggestions", []),
                "achievement_suggestions": data.get("achievement_suggestions", []),
            }
        
        elif improvement_type == "grammar":
            return {
                "resume_name": resume_name,
                "improvement_type": improvement_type,
                "improvement_type_title": type_titles.get(improvement_type, improvement_type.title()),
                "grammar_issues": data.get("grammar_issues", []),
                "style_suggestions": data.get("style_suggestions", []),
                "formatting_issues": data.get("formatting_issues", []),
                "clarity_suggestions": data.get("clarity_suggestions", []),
            }
        
        else:  # comprehensive
            return {
                "resume_name": resume_name,
                "improvement_type": improvement_type,
                "improvement_type_title": type_titles.get(improvement_type, improvement_type.title()),
                "overall_score": data.get("overall_score", 0),
                "strengths": data.get("strengths", []),
                "critical_issues": data.get("critical_issues", []),
                "keyword_analysis": data.get("keyword_analysis", {}),
                "content_improvements": data.get("content_improvements", []),
                "ats_optimization": data.get("ats_optimization", []),
                "priority_actions": data.get("priority_actions", []),
            }
    except Exception as e:
        logger.warning(f"LLM improvement analysis failed, using mock. Error: {e}")
        # Map improvement types to titles
        type_titles = {
            "keywords": "ATS Keyword Enhancement",
            "role": "Role Alignment",
            "grammar": "Grammar & Style",
            "comprehensive": "Comprehensive Analysis"
        }
        
        # Convert simple strings to suggestion objects
        def format_suggestions(suggestions):
            if not suggestions:
                return []
            formatted = []
            for suggestion in suggestions:
                if isinstance(suggestion, dict):
                    formatted.append(suggestion)
                else:
                    formatted.append({
                        "description": suggestion,
                        "example": f"Example: {suggestion.lower()}"
                    })
            return formatted
        
        # Fallback mock data based on improvement type
        if improvement_type == "keywords":
            return {
                "resume_name": resume_name,
                "improvement_type": improvement_type,
                "improvement_type_title": type_titles.get(improvement_type, improvement_type.title()),
                "missing_keywords": ["Python", "AWS", "Docker", "Agile", "DevOps"],
                "keyword_suggestions": [
                    {
                        "category": "Technical Skills",
                        "missing": ["Python", "AWS", "Docker"],
                        "reason": "These are high-demand skills in the field"
                    }
                ],
                "ats_score_impact": "Adding these keywords could increase ATS score by 15-25 points"
            }
        
        elif improvement_type == "role":
            return {
                "resume_name": resume_name,
                "improvement_type": improvement_type,
                "improvement_type_title": type_titles.get(improvement_type, improvement_type.title()),
                "missing_metrics": ["specific numbers", "percentages", "quantified achievements"],
                "role_suggestions": [
                    {
                        "section": "Experience",
                        "improvement": "Add specific metrics like 'increased sales by 25%'",
                        "example": "Instead of 'improved performance', write 'improved performance by 30%'"
                    }
                ],
                "achievement_suggestions": ["specific accomplishments with numbers", "project outcomes"]
            }
        
        elif improvement_type == "grammar":
            return {
                "resume_name": resume_name,
                "improvement_type": improvement_type,
                "improvement_type_title": type_titles.get(improvement_type, improvement_type.title()),
                "grammar_issues": ["inconsistent verb tense", "weak action verbs"],
                "style_suggestions": [
                    {
                        "issue": "Inconsistent verb tense",
                        "fix": "Use past tense for previous roles",
                        "example": "Change 'I manage' to 'I managed' for past positions"
                    }
                ],
                "formatting_issues": ["inconsistent bullet points", "spacing problems"],
                "clarity_suggestions": ["unclear sentences", "jargon without explanation"]
            }
        
        else:  # comprehensive
            return {
                "resume_name": resume_name,
                "improvement_type": improvement_type,
                "improvement_type_title": type_titles.get(improvement_type, improvement_type.title()),
                "overall_score": 75,
                "strengths": ["Good technical background", "Relevant experience"],
                "critical_issues": ["Missing specific metrics", "Generic descriptions"],
                "keyword_analysis": {
                    "missing_essential": ["Python", "AWS", "Agile"],
                    "overused": ["responsible for", "worked on"],
                    "suggested_additions": ["Docker", "DevOps", "CI/CD"]
                },
                "content_improvements": [
                    {
                        "section": "Professional Summary",
                        "current_issue": "Too generic",
                        "suggestion": "Add specific achievements with metrics",
                        "example": "Results-driven Software Engineer with 5+ years developing scalable web applications"
                    }
                ],
                "ats_optimization": ["Add more industry-specific keywords", "Include relevant certifications"],
                "priority_actions": ["Add 5-7 specific metrics to work experience", "Include 3-5 missing technical skills"]
            }