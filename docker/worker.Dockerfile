FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin libgdal-dev libgeos-dev libproj-dev \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -e .

COPY . .

CMD ["celery", "-A", "app.tasks.celery_app", "worker", "--loglevel=info"]
