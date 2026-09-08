"""Caches model *outputs* -- not just decoded rasters -- by content
checksum, so asking about the same image again doesn't re-run inference
that was already computed. Uses the same pluggable cache backend as
app/preprocessing/pipeline.py's raster cache (in-memory by default, Redis
when REDIS_URL is set) -- this module only adds the key scheme and the
get-or-compute wrapper on top of it.

Two key strategies, matching what each capability actually depends on
(verified against each adapter's real predict() signature, not assumed):
- vqa/captioning/grounding: InternVL's real answer depends on the question
  text, so it's part of the key -- two different questions about the same
  image must never share a cached answer.
- change_detection/optical_sar_fusion: ChangeFormer and CROMA's real
  predict() calls take only the image array(s), no question -- the engine
  happens to pass one through for the mock adapters' answer phrasing, but
  the real models never see it, so caching by image checksum(s) alone is
  correct and doesn't need the question in the key.

model_id + version are always part of the key, so pointing *_MODEL_PATH at
a different or upgraded checkpoint naturally misses the old cache instead
of serving a stale answer from a model that's no longer the one running.
"""
from __future__ import annotations

import hashlib
import pickle
from typing import Any

from app.storage.cache import get_cache_backend

# Purely content-addressed (checksums + model identity, optionally + exact
# question) -- there's no correctness reason for these to expire quickly,
# just a bound on unbounded growth in a long-lived process.
_TTL_SECONDS = 30 * 24 * 3600


def _build_key(capability: str, model_id: str, model_version: str, checksums: list[str], question: str | None) -> str:
    parts = [capability, model_id, model_version, *sorted(checksums)]
    if question:
        # Normalize case/whitespace so trivially different phrasing of the
        # exact same question still hits the cache, without conflating
        # genuinely different questions.
        parts.append(question.strip().lower())
    raw = "|".join(parts)
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return f"modelout:{digest}"


def get_cached_output(
    capability: str, model_id: str, model_version: str, checksums: list[str], question: str | None = None
) -> dict[str, Any] | None:
    key = _build_key(capability, model_id, model_version, checksums, question)
    cached = get_cache_backend().get_bytes(key)
    if cached is None:
        return None
    return pickle.loads(cached)


def set_cached_output(
    capability: str,
    model_id: str,
    model_version: str,
    checksums: list[str],
    output: dict[str, Any],
    question: str | None = None,
) -> None:
    key = _build_key(capability, model_id, model_version, checksums, question)
    get_cache_backend().set_bytes(key, pickle.dumps(dict(output)), ttl_seconds=_TTL_SECONDS)
