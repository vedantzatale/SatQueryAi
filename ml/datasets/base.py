"""BaseDatasetAdapter -- converts a source dataset's raw format into a
normalized internal record so training/evaluation code never hardcodes
dataset-specific assumptions. Every concrete adapter here fails loudly
(FileNotFoundError with a clear message) when the real dataset files
aren't present -- it never fabricates a sample to keep a demo running.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterator


@dataclass
class VQASample:
    image_path: str
    question: str
    answer: str
    task: str = "vqa"  # vqa | captioning | grounding
    bbox: tuple[float, float, float, float] | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ChangeSample:
    before_path: str
    after_path: str
    mask_path: str | None = None
    question: str | None = None
    answer: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


class BaseDatasetAdapter(ABC):
    """Subclasses implement `__len__` and `__getitem__` (or `iter_samples`
    for datasets without a natural index), returning `VQASample` or
    `ChangeSample` records depending on the dataset's task type."""

    dataset_name: str

    def __init__(self, root_dir: str | Path) -> None:
        self.root_dir = Path(root_dir)
        if not self.root_dir.exists():
            raise FileNotFoundError(
                f"{self.dataset_name} root directory '{self.root_dir}' does not exist. "
                f"Download the dataset per docs/DATASETS.md before using this adapter."
            )

    @abstractmethod
    def __len__(self) -> int: ...

    @abstractmethod
    def __getitem__(self, index: int) -> VQASample | ChangeSample: ...

    def iter_samples(self) -> Iterator[VQASample | ChangeSample]:
        for i in range(len(self)):
            yield self[i]
