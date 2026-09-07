"""ISRO/SAC evaluation adapter.

Unlike the other adapters in this directory, ISRO/SAC has not published a
public dataset release with a fixed file layout -- there is nothing to
target. This adapter instead defines SatQuery AI's own manifest schema and
expects the real held-out ISRO/SAC evaluation set to be converted into it
before running an evaluation. It is otherwise held to the same rule as
every other adapter here: it fails with `FileNotFoundError` when the
manifest is missing, and never fabricates a sample.

Expected layout (see docs/DATASETS.md):

    root_dir/manifest.json  # list of entries, each with a "task" field

VQA / captioning / grounding entry:
    {"task": "vqa", "image": "images/x.tif", "question": "...", "answer": "...",
     "bbox": [x, y, w, h]}                                    # bbox optional, grounding only

Change entry:
    {"task": "change_vqa", "before": "images/x_before.tif", "after": "images/x_after.tif",
     "question": "...", "answer": "...", "mask": "masks/x_mask.png"}   # mask optional

Per docs/DATASETS.md: real ISRO/SAC evaluation data must never be
committed to this repository or used in training/demo code -- this
adapter is only ever pointed at a gitignored `data/eval/isro_sac/` (or
similar) directory supplied out of band.
"""
from __future__ import annotations

import json
from pathlib import Path

from ml.datasets.base import BaseDatasetAdapter, ChangeSample, VQASample

_CHANGE_TASKS = {"change_vqa", "change_detection"}


class ISROSACAdapter(BaseDatasetAdapter):
    dataset_name = "ISRO/SAC"

    def __init__(self, root_dir: str) -> None:
        super().__init__(root_dir)
        manifest_path = self.root_dir / "manifest.json"
        if not manifest_path.exists():
            raise FileNotFoundError(
                f"Expected manifest '{manifest_path}' not found. "
                "Real ISRO/SAC evaluation data has no public file layout to target -- "
                "convert it into SatQuery AI's manifest schema (see docs/DATASETS.md) "
                "before evaluating. This adapter will not fabricate samples."
            )
        with open(manifest_path, encoding="utf-8") as f:
            self._entries = json.load(f)

    def __len__(self) -> int:
        return len(self._entries)

    def __getitem__(self, index: int) -> VQASample | ChangeSample:
        entry = self._entries[index]
        task = entry.get("task", "vqa")

        if task in _CHANGE_TASKS:
            return ChangeSample(
                before_path=str(self.root_dir / entry["before"]),
                after_path=str(self.root_dir / entry["after"]),
                mask_path=str(self.root_dir / entry["mask"]) if entry.get("mask") else None,
                question=entry.get("question"),
                answer=entry.get("answer"),
                metadata={"task": task, **entry.get("metadata", {})},
            )

        bbox = tuple(entry["bbox"]) if entry.get("bbox") else None
        return VQASample(
            image_path=str(self.root_dir / entry["image"]),
            question=entry.get("question", ""),
            answer=entry.get("answer", ""),
            task=task,
            bbox=bbox,
            metadata=entry.get("metadata", {}),
        )
