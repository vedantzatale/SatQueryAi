"""CDVQA adapter -- change-detection visual question answering.

Expects a before/after image pair per entry plus a question/answer about
the change between them (see docs/DATASETS.md for the exact CDVQA release
layout this targets):

    root_dir/images/<pair_id>_before.png
    root_dir/images/<pair_id>_after.png
    root_dir/annotations.json  # [{"pair_id":..., "question":..., "answer":...}]
"""
from __future__ import annotations

import json
from pathlib import Path

from ml.datasets.base import BaseDatasetAdapter, ChangeSample


class CDVQAAdapter(BaseDatasetAdapter):
    dataset_name = "CDVQA"

    def __init__(self, root_dir: str) -> None:
        super().__init__(root_dir)
        annotation_path = self.root_dir / "annotations.json"
        if not annotation_path.exists():
            raise FileNotFoundError(
                f"Expected annotation file '{annotation_path}' not found. "
                "Download CDVQA and place its annotation JSON per docs/DATASETS.md."
            )
        with open(annotation_path, encoding="utf-8") as f:
            self._entries = json.load(f)

    def __len__(self) -> int:
        return len(self._entries)

    def __getitem__(self, index: int) -> ChangeSample:
        entry = self._entries[index]
        pair_id = entry["pair_id"]
        return ChangeSample(
            before_path=str(self.root_dir / "images" / f"{pair_id}_before.png"),
            after_path=str(self.root_dir / "images" / f"{pair_id}_after.png"),
            question=entry.get("question"),
            answer=entry.get("answer"),
            metadata={"pair_id": pair_id},
        )
