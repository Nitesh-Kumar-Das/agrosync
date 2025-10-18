# ML Service Dockerfile for Python FastAPI + PyTorch
FROM python:3.11-slim-bookworm

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libgomp1 \
    dumb-init \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user
RUN groupadd -r mluser -g 1001 && \
    useradd -r -u 1001 -g mluser mluser

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=mluser:mluser . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/uploads && \
    mkdir -p /app/models && \
    chown -R mluser:mluser /app && \
    chmod 755 /app/uploads

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV ENV=production
ENV ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
ENV MPLCONFIGDIR=/tmp/matplotlib

USER mluser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD python -c "import requests; r=requests.get('http://localhost:8000/health'); r.raise_for_status()" || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--log-level", "info"]
