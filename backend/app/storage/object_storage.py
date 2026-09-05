"""Unified object storage abstraction supporting Local Filesystem and MinIO/S3."""
from __future__ import annotations

import io
import tempfile
from abc import ABC, abstractmethod
from pathlib import Path
from typing import ClassVar

from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class ObjectStorage(ABC):
    @abstractmethod
    def put_bytes(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        """Store bytes at key and return the key."""
        raise NotImplementedError

    @abstractmethod
    def get_bytes(self, key: str) -> bytes:
        """Retrieve bytes by key. Raises FileNotFoundError if missing."""
        raise NotImplementedError

    @abstractmethod
    def exists(self, key: str) -> bool:
        """Check if key exists."""
        raise NotImplementedError

    @abstractmethod
    def get_local_path(self, key: str) -> Path:
        """Return a local Path to the object (downloading/caching if remote)."""
        raise NotImplementedError


class LocalStorage(ObjectStorage):
    """Local filesystem-backed object storage."""

    def __init__(self, root: Path | str) -> None:
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)

    def put_bytes(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        dest = self.root / key
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return key

    def get_bytes(self, key: str) -> bytes:
        dest = self.root / key
        if not dest.is_file():
            raise FileNotFoundError(f"Object not found: {key}")
        return dest.read_bytes()

    def exists(self, key: str) -> bool:
        return (self.root / key).is_file()

    def get_local_path(self, key: str) -> Path:
        dest = self.root / key
        if not dest.is_file():
            dest.parent.mkdir(parents=True, exist_ok=True)
        return dest


class MinIOStorage(ObjectStorage):
    """MinIO/S3-compatible object storage."""

    def __init__(
        self,
        endpoint: str,
        access_key: str,
        secret_key: str,
        bucket: str = "satquery",
        secure: bool | None = None,
    ) -> None:
        from minio import Minio

        clean_endpoint = endpoint.replace("http://", "").replace("https://", "")
        if secure is None:
            secure = endpoint.startswith("https://")

        self.bucket = bucket
        self.client = Minio(
            clean_endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure,
        )
        self._cache_dir = Path(tempfile.gettempdir()) / "satquery_minio_cache"
        self._cache_dir.mkdir(parents=True, exist_ok=True)

        # Ensure bucket exists
        if not self.client.bucket_exists(self.bucket):
            self.client.make_bucket(self.bucket)

    def put_bytes(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        stream = io.BytesIO(data)
        self.client.put_object(
            bucket_name=self.bucket,
            object_name=key,
            data=stream,
            length=len(data),
            content_type=content_type,
        )
        # Update local cache if present
        cache_path = self._cache_dir / key
        if cache_path.parent.exists():
            cache_path.parent.mkdir(parents=True, exist_ok=True)
            cache_path.write_bytes(data)
        return key

    def get_bytes(self, key: str) -> bytes:
        from minio.error import S3Error

        try:
            response = self.client.get_object(self.bucket, key)
            try:
                return response.read()
            finally:
                response.close()
                response.release_conn()
        except S3Error as err:
            raise FileNotFoundError(f"Object {key} not found in MinIO: {err}") from err

    def exists(self, key: str) -> bool:
        try:
            self.client.stat_object(self.bucket, key)
            return True
        except Exception:
            return False

    def get_local_path(self, key: str) -> Path:
        cache_path = self._cache_dir / key
        if not cache_path.is_file():
            cache_path.parent.mkdir(parents=True, exist_ok=True)
            data = self.get_bytes(key)
            cache_path.write_bytes(data)
        return cache_path


_storage_instance: ObjectStorage | None = None


def get_storage_backend(settings: Settings | None = None) -> ObjectStorage:
    global _storage_instance
    if _storage_instance is not None:
        return _storage_instance

    if settings is None:
        from app.core.config import Settings

        settings = Settings()

    if settings.storage_backend == "minio" and settings.minio_endpoint:
        try:
            _storage_instance = MinIOStorage(
                endpoint=settings.minio_endpoint,
                access_key=settings.minio_access_key,
                secret_key=settings.minio_secret_key,
                bucket=settings.minio_bucket,
            )
            logger.info("storage_backend_initialized", backend="minio", bucket=settings.minio_bucket)
            return _storage_instance
        except Exception as exc:
            logger.warning("minio_init_failed_fallback_to_local", error=str(exc))

    _storage_instance = LocalStorage(root=settings.local_storage_root)
    logger.info("storage_backend_initialized", backend="local", root=str(settings.local_storage_root))
    return _storage_instance
