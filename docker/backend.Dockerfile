FROM python:3.11-slim

# GDAL/rasterio/geopandas need these system libs
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

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
