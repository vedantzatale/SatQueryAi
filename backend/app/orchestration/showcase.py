"""Curated reference answers for known demo images (data/showcase/showcase_qa.json).

Built for controlled product demos: a query only ever matches an entry here
when BOTH the uploaded image's SHA-256 checksum AND the (normalized)
question text match an entry exactly. Anything else -- a different image, a
different question about a matched image, or a partial/fuzzy match -- falls
straight through to the real model pipeline unchanged (see engine.py::run).

This is a pre-verified reference answer, not a fabricated one: every entry
was checked against its actual source image before being added. It exists
so a live demo doesn't depend on a CPU-only model call finishing in time,
not to misrepresent what ran -- see ModelProvenance.source in
app/schemas/provenance.py for how a hit is truthfully recorded.
"""
from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

_REGISTRY_PATH = Path(__file__).resolve().parent.parent / "data" / "showcase" / "showcase_qa.json"


@dataclass(frozen=True)
class ShowcaseEvidence:
    label: str
    bbox: tuple[int, int, int, int] | None
    score: float | None


@dataclass(frozen=True)
class ShowcaseMatch:
    image_id: str
    task: str
    language: str
    question: str
    answer: str
    confidence: float
    evidence: tuple[ShowcaseEvidence, ...]


def _normalize_question(text: str) -> str:
    """Case/whitespace/punctuation-insensitive so pasting the question from
    the reference doc with a trailing '?' or a stray space still matches,
    without ever conflating two genuinely different questions."""
    text = unicodedata.normalize("NFKC", text or "").strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text.rstrip("?!.。！？ ")


@lru_cache
def _load_registry() -> dict[str, dict]:
    if not _REGISTRY_PATH.exists():
        return {}
    with open(_REGISTRY_PATH, encoding="utf-8") as f:
        raw = json.load(f)
    by_checksum: dict[str, dict] = {}
    for image in raw.get("images", []):
        qa_by_question = {_normalize_question(qa["question"]): qa for qa in image.get("qa", [])}
        by_checksum[image["checksum"]] = {"id": image["id"], "qa": qa_by_question}
    return by_checksum


def find_showcase_match(checksum: str | None, query_text: str) -> ShowcaseMatch | None:
    if not checksum:
        return None
    image_entry = _load_registry().get(checksum)
    if image_entry is None:
        return None
    qa = image_entry["qa"].get(_normalize_question(query_text))
    if qa is None:
        return None
    evidence = tuple(
        ShowcaseEvidence(
            label=e.get("label", "region"),
            bbox=tuple(e["bbox"]) if e.get("bbox") else None,
            score=e.get("score"),
        )
        for e in qa.get("evidence", [])
    )
    return ShowcaseMatch(
        image_id=image_entry["id"],
        task=qa["task"],
        language=qa.get("language", "en"),
        question=qa["question"],
        answer=qa["answer"],
        confidence=qa["confidence"],
        evidence=evidence,
    )
