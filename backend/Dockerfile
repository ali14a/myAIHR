# Multi-stage Dockerfile for AI Resume Scanner with Ollama
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_PORT=11434
ENV OLLAMA_API=http://localhost:11434/api/generate
ENV OLLAMA_MODEL=llama3.2:1b

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    python3-venv \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install Ollama with retry mechanism
RUN for i in {1..3}; do \
        curl -fsSL https://ollama.ai/install.sh | sh && break || \
        (echo "Attempt $i failed, retrying..." && sleep 10); \
    done

# Copy requirements first for better caching
COPY requirements.txt .

# Create virtual environment and install Python dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p uploads/resumes uploads/profile_photos database logs static && \
    chmod +x setup/quickstart.sh

# Create a script to download the model
RUN echo '#!/bin/bash\n\
ollama serve &\n\
sleep 15\n\
ollama pull llama3.2:1b\n\
pkill ollama\n\
' > /app/download_model.sh && chmod +x /app/download_model.sh

# Download the model
RUN /app/download_model.sh

# Expose ports
EXPOSE 8000 11434

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Create startup script
RUN echo '#!/bin/bash\n\
# Start Ollama in background\n\
echo "Starting Ollama service..."\n\
ollama serve &\n\
\n\
# Wait for Ollama to start\n\
echo "Waiting for Ollama to start..."\n\
while ! curl -s http://localhost:11434/api/tags > /dev/null; do\n\
    echo "Waiting for Ollama..."\n\
    sleep 2\n\
done\n\
echo "Ollama is ready!"\n\
\n\
# Ensure the model is available\n\
echo "Checking if model is available..."\n\
if ! ollama list | grep -q "llama3.2:1b"; then\n\
    echo "Model not found, pulling llama3.2:1b..."\n\
    ollama pull llama3.2:1b\n\
fi\n\
echo "Model is ready!"\n\
\n\
# Initialize default user\n\
echo "Initializing default user..."\n\
python3 /app/init_user.py\n\
\n\
# Start the FastAPI application\n\
echo "Starting FastAPI application..."\n\
uvicorn app:app --host 0.0.0.0 --port 8000 --reload\n\
' > /app/start.sh && chmod +x /app/start.sh

# Default command
CMD ["/app/start.sh"]