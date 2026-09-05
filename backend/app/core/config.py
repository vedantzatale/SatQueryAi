"""Central application configuration, loaded from environment variables.

Every external dependency (DB, Redis, MinIO, satellite providers, ML model
weights) is optional. When unset, the corresponding service operates in a
local/mock fallback mode so the system runs end-to-end without any of them.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(REPO_ROOT / ".env"), extra="ignore")

    # Core mode
    demo_mode: bool = Field(default=True, alias="DEMO_MODE")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # Database
    database_url: str = Field(default="sqlite:///./satquery_dev.db", alias="DATABASE_URL")

    # Redis / task queue
    redis_url: str = Field(default="", alias="REDIS_URL")
    task_backend: Literal["inline", "celery"] = Field(default="inline", alias="TASK_BACKEND")

    # Object storage
    storage_backend: Literal["local", "minio"] = Field(default="local", alias="STORAGE_BACKEND")
    local_storage_root: Path = Field(
        default=REPO_ROOT / "data" / "local_storage", alias="LOCAL_STORAGE_ROOT"
    )
    minio_endpoint: str = Field(default="", alias="MINIO_ENDPOINT")
    minio_access_key: str = Field(default="", alias="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field(default="", alias="MINIO_SECRET_KEY")
    minio_bucket: str = Field(default="satquery", alias="MINIO_BUCKET")
    report_storage_bucket: str = Field(default="satquery-reports", alias="REPORT_STORAGE_BUCKET")

    # Satellite providers
    copernicus_client_id: str = Field(default="", alias="COPERNICUS_CLIENT_ID")
    copernicus_client_secret: str = Field(default="", alias="COPERNICUS_CLIENT_SECRET")
    bhoonidhi_api_url: str = Field(default="", alias="BHOONIDHI_API_URL")
    bhoonidhi_api_key: str = Field(default="", alias="BHOONIDHI_API_KEY")
    usgs_api_key: str = Field(default="", alias="USGS_API_KEY")
    satellite_provider_priority: str = Field(
        default="copernicus,bhoonidhi,usgs", alias="SATELLITE_PROVIDER_PRIORITY"
    )

    # Agent
    agent_model_name: str = Field(default="Qwen3-8B", alias="AGENT_MODEL_NAME")
    agent_model_path: str = Field(default="", alias="AGENT_MODEL_PATH")

    # Model adapters
    internvl_model_path: str = Field(default="", alias="INTERNVL_MODEL_PATH")
    prithvi_model_path: str = Field(default="", alias="PRITHVI_MODEL_PATH")
    change_model_path: str = Field(default="", alias="CHANGE_MODEL_PATH")
    croma_model_path: str = Field(default="", alias="CROMA_MODEL_PATH")
    sar_model_path: str = Field(default="", alias="SAR_MODEL_PATH")
    terramind_enabled: bool = Field(default=False, alias="TERRAMIND_ENABLED")
    terramind_model_path: str = Field(default="", alias="TERRAMIND_MODEL_PATH")

    # Compute
    device: str = Field(default="auto", alias="DEVICE")

    # Security
    jwt_secret: str = Field(default="", alias="JWT_SECRET")
    cors_allowed_origins: str = Field(default="http://localhost:3000", alias="CORS_ALLOWED_ORIGINS")
    max_upload_size_mb: int = Field(default=200, alias="MAX_UPLOAD_SIZE_MB")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_allowed_origins.split(",") if o.strip()]

    @property
    def satellite_provider_priority_list(self) -> list[str]:
        return [p.strip() for p in self.satellite_provider_priority.split(",") if p.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
