"""SceneRanker -- deterministic, pair-aware scene scoring (plan §8). Never
selects a scene just because it was the first API result; for bi-temporal
requests it scores compatible before/after PAIRS, not two independent
single-scene rankings.
"""
from __future__ import annotations

from datetime import date, datetime

from app.schemas.satellite import SceneCandidate


def score_single(candidate: SceneCandidate, target_modality: str) -> SceneCandidate:
    c = candidate.model_copy()
    c.modality_score = 1.0 if c.modality == target_modality else 0.0
    c.cloud_score = (
        max(0.0, 1.0 - (c.cloud_percentage / 100.0)) if c.cloud_percentage is not None else 0.5
    )
    c.quality_score = 0.7 if c.resolution is not None and c.resolution <= 10 else 0.4
    c.resolution_score = 1.0 if c.resolution is not None else 0.3
    c.crs_compat_score = 1.0 if c.crs else 0.3
    c.sensor_compat_score = 1.0 if c.sensor else 0.5
    c.provider_availability_score = 0.5 if c.demo_mode else 1.0
    c.coverage_score = 0.5  # refined further once real AOI-intersection geometry is wired in
    return c


def rank_single(candidates: list[SceneCandidate], target_modality: str) -> list[SceneCandidate]:
    scored = [score_single(c, target_modality) for c in candidates]
    return sorted(scored, key=lambda c: c.total_score, reverse=True)


def _temporal_fit(acquisition: datetime | None, target: date, tolerance_days: int = 200) -> float:
    if acquisition is None:
        return 0.0
    delta_days = abs((acquisition.date() - target).days)
    if delta_days > tolerance_days:
        return 0.0
    return max(0.0, 1.0 - delta_days / tolerance_days)


def rank_pairs(
    before_candidates: list[SceneCandidate],
    after_candidates: list[SceneCandidate],
    before_target: date,
    after_target: date,
    target_modality: str,
) -> tuple[SceneCandidate, SceneCandidate] | None:
    """Scores compatible (before, after) PAIRS -- not two independent
    per-scene rankings -- and returns the best-scoring compatible pair."""
    best_pair: tuple[SceneCandidate, SceneCandidate] | None = None
    best_score = -1.0

    for before in before_candidates:
        b = score_single(before, target_modality)
        b.temporal_score = _temporal_fit(b.acquisition_time, before_target)
        if b.temporal_score == 0.0:
            continue
        for after in after_candidates:
            a = score_single(after, target_modality)
            a.temporal_score = _temporal_fit(a.acquisition_time, after_target)
            if a.temporal_score == 0.0:
                continue
            if b.crs and a.crs and b.crs != a.crs:
                a.crs_compat_score *= 0.5
                b.crs_compat_score *= 0.5
            if b.sensor and a.sensor and b.sensor != a.sensor:
                a.sensor_compat_score *= 0.5
                b.sensor_compat_score *= 0.5

            pair_score = b.total_score + a.total_score
            if pair_score > best_score:
                best_score = pair_score
                best_pair = (b, a)

    return best_pair
