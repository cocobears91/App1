FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY src ./src
COPY scripts ./scripts
COPY knowledge_base ./knowledge_base
COPY schema ./schema
COPY data ./data

ENV PYTHONPATH=/app/src

CMD ["python", "scripts/train.py", "--samples", "2000"]
