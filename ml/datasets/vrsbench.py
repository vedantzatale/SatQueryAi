"""VRSBench adapter.

VRSBench distributes a JSON annotation file per split with entries
covering captioning, VQA, and visual grounding over the same underlying
image set. This adapter expects (adjust field names in `_parse_entry` if
a specific VRSBench release names them differently -- see
docs/DATASETS.md):

    root_dir/images/<image_id>.png
    root_dir/<split>_annotations.json  # list of entry dicts, e.g.:
    [{"image_id": "...", "task": "vqa"|"caption"|"grounding",
      "question": "...", "answer": "...", "bbox": [x1,y1,x2,y2]}, ...]
"""
from __future__ import annotations

import json
from pathlib import Path

from ml.datasets.base import BaseDatasetAdapter, VQASample


class VRSBenchAdapter(BaseDatasetAdapter):
    dataset_name = "VRSBench"

    def __init__(self, root_dir: str, split: str = "test") -> None:
        super().__init__(root_dir)
        self.split = split
        annotation_path = self.root_dir / f"{split}_annotations.json"
        if not annotation_path.exists():
            raise FileNotFoundError(
                f"Expected annotation file '{annotation_path}' not found. "
                "Download VRSBench and place its annotation JSON per docs/DATASETS.md."
            )
        with open(annotation_path, encoding="utf-8") as f:
            self._entries = json.load(f)

    def __len__(self) -> int:
        return len(self._entries)

    def __getitem__(self, index: int) -> VQASample:
        entry = self._entries[index]
        image_path = str(self.root_dir / "images" / f"{entry['image_id']}.png")
        task_raw = entry.get("task", "vqa")
        task = "captioning" if task_raw == "caption" else task_raw
        bbox = tuple(entry["bbox"]) if entry.get("bbox") else None
        return VQASample(
            image_path=image_path,
            question=entry.get("question", ""),
            answer=entry.get("answer", ""),
            task=task,
            bbox=bbox,
            metadata={"image_id": entry["image_id"], "split": self.split},
        )
