# Resume Scanner - Function Documentation

## Overview
This document provides comprehensive documentation for all functions and their usage in the Resume Scanner application. The application is built with FastAPI, SQLAlchemy, and integrates with Ollama LLM for AI-powered resume analysis.

## Table of Contents
1. [Core Application Functions](#core-application-functions)
2. [Authentication Functions](#authentication-functions)
3. [Database Functions](#database-functions)
4. [Utility Functions](#utility-functions)
5. [Model Definitions](#model-definitions)
6. [Configuration](#configuration)

---

## Core Application Functions

### FastAPI Routes (`app.py`)

#### Authentication Routes

##### `get_login(request: Request, db: Session)`
- **Purpose**: Display the login page
- **Parameters**: 
  - `request`: FastAPI Request object
  - `db`: Database session
- **Returns**: HTML template response
- **Usage**: Renders the login form for user authentication

##### `post_login(request: Request, email: str, password: str, db: Session)`
- **Purpose**: Authenticate user and create session
- **Parameters**:
  - `request`: FastAPI Request object
  - `email`: User email address
  - `password`: User password
  - `db`: Database session
- **Returns**: RedirectResponse to dashboard or error page
- **Usage**: Validates credentials and sets session cookie

##### `logout(request: Request)`
- **Purpose**: Logout user and clear session
- **Parameters**: `request`: FastAPI Request object
- **Returns**: RedirectResponse to login page
- **Usage**: Removes session cookie and redirects to login

#### Dashboard Routes

##### `dashboard(request: Request, db: Session)`
- **Purpose**: Display user dashboard with resume scans and quota
- **Parameters**:
  - `request`: FastAPI Request object
  - `db`: Database session
- **Returns**: HTML template response with user data
- **Usage**: Shows user's resume scans, quota remaining, and quick actions

#### Resume Upload Routes

##### `get_upload(request: Request, db: Session)`
- **Purpose**: Display resume upload page
- **Parameters**:
  - `request`: FastAPI Request object
  - `db`: Database session
- **Returns**: HTML template response
- **Usage**: Renders upload form for resumes and job descriptions

##### `post_upload(request: Request, file: UploadFile, db: Session)`
- **Purpose**: Handle resume file upload and analysis
- **Parameters**:
  - `request`: FastAPI Request object
  - `file`: Uploaded file (PDF/DOCX)
  - `db`: Database session
- **Returns**: HTML template response with analysis results
- **Usage**: Processes uploaded resume, extracts text, and runs AI analysis

#### Job Description Routes

##### `get_jd(request: Request, db: Session)`
- **Purpose**: Display job description management page
- **Parameters**:
  - `request`: FastAPI Request object
  - `db`: Database session
- **Returns**: HTML template response
- **Usage**: Shows saved job descriptions and allows creation of new ones

##### `post_jd(request: Request, title: str, company: str, content: str, db: Session)`
- **Purpose**: Save new job description
- **Parameters**:
  - `request`: FastAPI Request object
  - `title`: Job title
  - `company`: Company name
  - `content`: Job description content
  - `db`: Database session
- **Returns**: HTML template response
- **Usage**: Stores job description in database

#### Comparison Routes

##### `get_compare(request: Request, db: Session)`
- **Purpose**: Display resume comparison page
- **Parameters**:
  - `request`: FastAPI Request object
  - `db`: Database session
- **Returns**: HTML template response
- **Usage**: Shows form to select resume and job description for comparison

##### `post_compare(request: Request, resume_id: int, jd_id: int, jd_title: str, jd_company: str, jd_content: str, db: Session)`
- **Purpose**: Compare resume against job description
- **Parameters**:
  - `request`: FastAPI Request object
  - `resume_id`: ID of resume to compare
  - `jd_id`: ID of saved job description (optional)
  - `jd_title`: Job title (for adhoc comparison)
  - `jd_company`: Company name (for adhoc comparison)
  - `jd_content`: Job description content (for adhoc comparison)
  - `db`: Database session
- **Returns**: HTML template response with comparison results
- **Usage**: Analyzes resume match against job requirements

#### Improvement Routes

##### `get_improve(request: Request, db: Session)`
- **Purpose**: Display resume improvement page
- **Parameters**:
  - `request`: FastAPI Request object
  - `db`: Database session
- **Returns**: HTML template response
- **Usage**: Shows form to select resume and improvement type

##### `post_improve(request: Request, resume_id: int, improvement_type: str, db: Session)`
- **Purpose**: Generate resume improvement suggestions
- **Parameters**:
  - `request`: FastAPI Request object
  - `resume_id`: ID of resume to improve
  - `improvement_type`: Type of improvement (keywords, role, grammar, comprehensive)
  - `db`: Database session
- **Returns**: HTML template response with improvement suggestions
- **Usage**: Uses AI to generate specific improvement recommendations

#### Cover Letter Routes

##### `get_cover_letter(request: Request, db: Session)`
- **Purpose**: Display cover letter generation page
- **Parameters**:
  - `request`: FastAPI Request object
  - `db`: Database session
- **Returns**: HTML template response
- **Usage**: Shows form to generate cover letters

##### `post_cover_letter(request: Request, resume_id: int, jd_id: int, jd_title: str, jd_company: str, jd_content: str, db: Session)`
- **Purpose**: Generate personalized cover letter
- **Parameters**:
  - `request`: FastAPI Request object
  - `resume_id`: ID of resume to use
  - `jd_id`: ID of saved job description (optional)
  - `jd_title`: Job title (for adhoc generation)
  - `jd_company`: Company name (for adhoc generation)
  - `jd_content`: Job description content (for adhoc generation)
  - `db`: Database session
- **Returns**: HTML template response with generated cover letter
- **Usage**: Creates personalized cover letter using AI

#### Profile Routes

##### `get_profile(request: Request, db: Session)`
- **Purpose**: Display user profile page
- **Parameters**:
  - `request`: FastAPI Request object
  - `db`: Database session
- **Returns**: HTML template response
- **Usage**: Shows user profile information and settings

##### `post_profile(request: Request, name: str, mobile: str, current_password: str, new_password: str, db: Session)`
- **Purpose**: Update user profile information
- **Parameters**:
  - `request`: FastAPI Request object
  - `name`: User's full name
  - `mobile`: User's mobile number
  - `current_password`: Current password for verification
  - `new_password`: New password (optional)
  - `db`: Database session
- **Returns**: HTML template response
- **Usage**: Updates user profile and optionally changes password

##### `post_profile_photo(request: Request, file: UploadFile, db: Session)`
- **Purpose**: Upload and update user profile photo
- **Parameters**:
  - `request`: FastAPI Request object
  - `file`: Uploaded image file
  - `db`: Database session
- **Returns**: JSON response with success status
- **Usage**: Handles profile photo upload and storage

---

## Authentication Functions (`auth.py`)

### Password Management

##### `get_password_hash(password: str) -> str`
- **Purpose**: Hash password using secure algorithm
- **Parameters**: `password`: Plain text password
- **Returns**: Hashed password string
- **Usage**: Creates secure password hash for storage

##### `verify_password(plain: str, hashed: str) -> bool`
- **Purpose**: Verify password against hash
- **Parameters**:
  - `plain`: Plain text password
  - `hashed`: Stored password hash
- **Returns**: Boolean indicating if password is correct
- **Usage**: Validates user login credentials

### User Management

##### `create_user(db: Session, email: str, password: str)`
- **Purpose**: Create new user account
- **Parameters**:
  - `db`: Database session
  - `email`: User email address
  - `password`: User password
- **Returns**: Created user object
- **Usage**: Registers new users in the system

##### `authenticate_user(db: Session, email: str, password: str) -> Optional[User]`
- **Purpose**: Authenticate user credentials
- **Parameters**:
  - `db`: Database session
  - `email`: User email address
  - `password`: User password
- **Returns**: User object if authenticated, None otherwise
- **Usage**: Validates login credentials

### Session Management

##### `create_session_token(email: str) -> str`
- **Purpose**: Create JWT session token
- **Parameters**: `email`: User email address
- **Returns**: JWT token string
- **Usage**: Generates secure session token for user

##### `get_current_user_from_request(request: Request, db: Session) -> Optional[User]`
- **Purpose**: Get current user from session token
- **Parameters**:
  - `request`: FastAPI Request object
  - `db`: Database session
- **Returns**: User object if valid session, None otherwise
- **Usage**: Validates session and returns current user

---

## Database Functions (`database.py`)

##### `get_db() -> Generator[Session, None, None]`
- **Purpose**: Database session dependency
- **Returns**: Database session generator
- **Usage**: Provides database session for route handlers

---

## Utility Functions (`utils.py`)

### File Processing

##### `extract_text_from_file(file_path: str) -> str`
- **Purpose**: Extract text from PDF or DOCX files
- **Parameters**: `file_path`: Path to file
- **Returns**: Extracted text content
- **Usage**: Processes uploaded resume files

### LLM Integration

##### `call_llm(prompt: str) -> str`
- **Purpose**: Call Ollama LLM with prompt
- **Parameters**: `prompt`: Text prompt for LLM
- **Returns**: LLM response text
- **Usage**: Communicates with local Ollama instance

##### `analyze_resume(resume_content: str, resume_name: str) -> dict`
- **Purpose**: Analyze resume using AI
- **Parameters**:
  - `resume_content`: Resume text content
  - `resume_name`: Name of resume file
- **Returns**: Analysis results dictionary
- **Usage**: Generates AI-powered resume analysis

##### `analyze_resume_match(resume_content: str, jd_content: str, jd_title: str, jd_company: str) -> dict`
- **Purpose**: Compare resume against job description
- **Parameters**:
  - `resume_content`: Resume text content
  - `jd_content`: Job description content
  - `jd_title`: Job title
  - `jd_company`: Company name
- **Returns**: Match analysis results
- **Usage**: Analyzes resume-job description compatibility

##### `analyze_resume_improvements(resume_content: str, improvement_type: str, resume_name: str) -> dict`
- **Purpose**: Generate resume improvement suggestions
- **Parameters**:
  - `resume_content`: Resume text content
  - `improvement_type`: Type of improvement needed
  - `resume_name`: Name of resume file
- **Returns**: Improvement suggestions dictionary
- **Usage**: Provides AI-powered improvement recommendations

##### `generate_cover_letter(resume_content: str, jd_content: str, jd_title: str, jd_company: str) -> str`
- **Purpose**: Generate personalized cover letter
- **Parameters**:
  - `resume_content`: Resume text content
  - `jd_content`: Job description content
  - `jd_title`: Job title
  - `jd_company`: Company name
- **Returns**: Generated cover letter text
- **Usage**: Creates personalized cover letters using AI

### Quota Management

##### `check_and_reset_quota(db: Session, user: User) -> int`
- **Purpose**: Check and reset user's monthly quota
- **Parameters**:
  - `db`: Database session
  - `user`: User object
- **Returns**: Remaining quota count
- **Usage**: Manages user scan limits

##### `consume_quota(db: Session, user: User)`
- **Purpose**: Consume one quota unit for user
- **Parameters**:
  - `db`: Database session
  - `user`: User object
- **Returns**: None
- **Usage**: Decrements user's remaining quota

### Helper Functions

##### `get_user_resumes(db: Session, user_id: int) -> List[ResumeScan]`
- **Purpose**: Get all resumes for a user
- **Parameters**:
  - `db`: Database session
  - `user_id`: User ID
- **Returns**: List of ResumeScan objects
- **Usage**: Retrieves user's uploaded resumes

##### `get_user_jds(db: Session, user_id: int) -> List[JobDescription]`
- **Purpose**: Get all job descriptions for a user
- **Parameters**:
  - `db`: Database session
  - `user_id`: User ID
- **Returns**: List of JobDescription objects
- **Usage**: Retrieves user's saved job descriptions

---

## Model Definitions (`models.py`)

### User Model
```python
class User(Base):
    id: int
    email: str
    hashed_password: str
    name: Optional[str]
    mobile: Optional[str]
    profile_photo: Optional[str]
    created_at: datetime
    last_login: Optional[datetime]
```

### ResumeScan Model
```python
class ResumeScan(Base):
    id: int
    user_id: int
    filename: str
    original_filename: str
    analysis_results: Optional[str]
    created_at: datetime
```

### JobDescription Model
```python
class JobDescription(Base):
    id: int
    user_id: int
    title: str
    company: str
    content: str
    created_at: datetime
```

### QuotaUsage Model
```python
class QuotaUsage(Base):
    id: int
    user_id: int
    month: int
    year: int
    scans_used: int
    created_at: datetime
```

---

## Configuration (`config.py`)

### Settings Class
```python
class Settings:
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    SESSION_COOKIE: str
    UPLOAD_DIR: str
    PROFILE_PHOTO_DIR: str
    MAX_FILE_SIZE: int
    ALLOWED_EXTENSIONS: List[str]
    MONTHLY_QUOTA: int
    UNLIMITED_QUOTA_EMAILS: List[str]
```

---

## Usage Examples

### Basic Resume Analysis
```python
# Extract text from uploaded file
resume_text = extract_text_from_file("path/to/resume.pdf")

# Analyze resume
analysis = analyze_resume(resume_text, "resume.pdf")

# Results include: score, strengths, weaknesses, suggestions
print(f"ATS Score: {analysis['score']}")
```

### Resume-Job Description Comparison
```python
# Compare resume against job description
match_analysis = analyze_resume_match(
    resume_content=resume_text,
    jd_content=job_description,
    jd_title="Software Engineer",
    jd_company="Tech Corp"
)

# Results include: match percentage, strengths, areas for improvement
print(f"Match Score: {match_analysis['match_score']}%")
```

### Resume Improvement Suggestions
```python
# Get improvement suggestions
improvements = analyze_resume_improvements(
    resume_content=resume_text,
    improvement_type="keywords",
    resume_name="resume.pdf"
)

# Results include: keyword suggestions, role suggestions, grammar suggestions
for suggestion in improvements['keyword_suggestions']:
    print(f"Suggestion: {suggestion['description']}")
```

### Cover Letter Generation
```python
# Generate cover letter
cover_letter = generate_cover_letter(
    resume_content=resume_text,
    jd_content=job_description,
    jd_title="Software Engineer",
    jd_company="Tech Corp"
)

print(cover_letter)
```

---

## Error Handling

All functions include comprehensive error handling:
- **File Processing**: Handles unsupported file formats and corrupted files
- **LLM Integration**: Manages connection timeouts and parsing errors
- **Database Operations**: Handles connection issues and constraint violations
- **Authentication**: Manages invalid credentials and session expiration

## Performance Considerations

- **File Upload**: Limited to 10MB maximum file size
- **LLM Calls**: Timeout after 60 seconds
- **Database**: Uses connection pooling for efficiency
- **Caching**: Resume analysis results are cached in database

## Security Features

- **Password Hashing**: Uses pbkdf2_sha256 with salt
- **Session Management**: JWT tokens with expiration
- **File Validation**: Checks file types and sizes
- **Input Sanitization**: All user inputs are validated and sanitized
