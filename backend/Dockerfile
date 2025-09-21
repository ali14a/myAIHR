# ===========================================
# BACKEND DOCKERFILE - LEARNING VERSION
# ===========================================
# This Dockerfile teaches you how to containerize a Python FastAPI app

# STEP 1: Choose a base image
# Think of this as choosing an operating system for your container
# Python 3.13 slim = Python + minimal Linux OS
FROM python:3.13-slim

# STEP 2: Set working directory inside the container
# This is like 'cd /app' - all commands will run from here
WORKDIR /app

# STEP 3: Set environment variables
# These help Python run better in containers
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# STEP 4: Install system dependencies
# Some Python packages need system libraries (like for PDF processing)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# STEP 5: Copy requirements first (for better caching)
# Docker caches each step. If requirements.txt doesn't change,
# it won't reinstall packages every time you change code
COPY requirements.txt .

# STEP 6: Install Python packages
# This installs all the packages your app needs
RUN pip install --no-cache-dir -r requirements.txt

# STEP 7: Copy your application code
# This copies all your Python files into the container
COPY . .

# STEP 8: Create necessary directories
# Your app needs these folders to store files
RUN mkdir -p uploads/resumes uploads/profile_photos database logs

# STEP 9: Expose the port your app runs on
# This tells Docker which port your app uses
EXPOSE 8000

# STEP 10: Define how to start your app
# This is the command that runs when the container starts
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
