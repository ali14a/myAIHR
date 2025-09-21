# Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have:
- Python 3.8+ installed
- Git installed
- At least 4GB RAM (8GB+ recommended for better performance)

## Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd myAIHr
```

### 2. Install Ollama

#### macOS:
```bash
brew install ollama
```

#### Linux:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows:
Download from [https://ollama.ai](https://ollama.ai)

### 3. Start Ollama and Install Model
```bash
# Start Ollama (keep this running)
ollama serve

# In a new terminal, install the model
ollama pull llama3.2:3b
```

### 4. Set Up Python Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
# Full installation (recommended):
pip install -r requirements.txt

# Or minimal installation:
# pip install -r requirements-minimal.txt
```

### 5. Create Environment File
Create a `.env` file in the project root with this content:

```bash
# Database Configuration
DATABASE_URL=sqlite:///./resume.db

# Security (CHANGE THIS IN PRODUCTION!)
SECRET_KEY=your-super-secret-key-here-change-this-in-production

# Session Configuration
ACCESS_TOKEN_EXPIRE_DAYS=7

# File Upload Settings
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Application Settings
MAX_MONTHLY_SCANS=5
DEBUG=False

# LLM Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

### 6. Initialize Database
```bash
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
```

### 7. Run the Application
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 8. Access the Application
Open your browser and go to: `http://localhost:8000`

## Verification

To verify everything is working:

1. **Check Ollama**: Visit `http://localhost:11434/api/tags` - you should see your model listed
2. **Check Application**: Visit `http://localhost:8000` - you should see the login page
3. **Test Upload**: Register an account and try uploading a resume

## Troubleshooting

### Ollama Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

### Port Issues
```bash
# Check what's using port 8000
lsof -i :8000

# Use a different port
uvicorn app:app --reload --host 0.0.0.0 --port 8001
```

### Database Issues
```bash
# Reset database
rm resume.db
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
```

## Next Steps

1. Register an account
2. Upload a resume
3. Add a job description
4. Try the comparison feature
5. Generate a cover letter

## Performance Tips

- For better analysis quality, use `llama3.2:8b` model (requires more RAM)
- Ensure Ollama is running before starting the application
- Close other applications to free up RAM for better performance
