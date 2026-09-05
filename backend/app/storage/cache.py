"""Caching interface supporting in-memory dict and Redis backends."""
from __future__ import annotations

import time
from abc import ABC, abstractmethod
from typing import ClassVar

from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class CacheBackend(ABC):
    @abstractmethod
    def get_bytes(self, key: str) -> bytes | None:
        """Retrieve raw bytes by key, or None if expired/not found."""
        raise NotImplementedError

    @abstractmethod
    def set_bytes(self, key: str, data: bytes, ttl_seconds: int = 3600) -> None:
        """Store raw bytes with a TTL in seconds."""
        raise NotImplementedError

    @abstractmethod
    def delete(self, key: str) -> None:
        """Remove a cached key."""
        raise NotImplementedError

    @abstractmethod
    def clear(self) -> None:
        """Clear the cache."""
        raise NotImplementedError


class InMemoryCacheBackend(CacheBackend):
    """In-process thread-safe dictionary cache with expiry timestamps."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[bytes, float]] = {}

    def get_bytes(self, key: str) -> bytes | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        data, expiry = entry
        if time.time() > expiry:
            self._store.pop(key, None)
            return None
        return data

    def set_bytes(self, key: str, data: bytes, ttl_seconds: int = 3600) -> None:
        expiry = time.time() + ttl_seconds
        self._store[key] = (data, expiry)

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()


class RedisCacheBackend(CacheBackend):
    """Redis-backed distributed cache."""

    def __init__(self, redis_url: str) -> None:
        import redis

        self._client = redis.from_url(redis_url)

    def get_bytes(self, key: str) -> bytes | None:
        try:
            return self._client.get(key)
        except Exception as exc:
            logger.warning("redis_cache_get_failed", key=key, error=str(exc))
            return None

    def set_bytes(self, key: str, data: bytes, ttl_seconds: int = 3600) -> None:
        try:
            self._client.set(key, data, ex=ttl_seconds)
        except Exception as exc:
            logger.warning("redis_cache_set_failed", key=key, error=str(exc))

    def delete(self, key: str) -> None:
        try:
            self._client.delete(key)
        except Exception as exc:
            logger.warning("redis_cache_delete_failed", key=key, error=str(exc))

    def clear(self) -> None:
        try:
            self._client.flushdb()
        except Exception as exc:
            logger.warning("redis_cache_clear_failed", error=str(exc))


_cache_instance: CacheBackend | None = None


def get_cache_backend(settings: Settings | None = None) -> CacheBackend:
    global _cache_instance
    if _cache_instance is not None:
        return _cache_instance

    if settings is None:
        from app.core.config import Settings

        settings = Settings()

    if settings.redis_url:
        try:
            _cache_instance = RedisCacheBackend(settings.redis_url)
            logger.info("cache_backend_initialized", backend="redis", url=settings.redis_url)
            return _cache_instance
        except Exception as exc:
            logger.warning("redis_init_failed_fallback_in_memory", error=str(exc))

    _cache_instance = InMemoryCacheBackend()
    logger.info("cache_backend_initialized", backend="in_memory")
    return _cache_instance
