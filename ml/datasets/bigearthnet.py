"""BigEarthNet-S1/S2 adapter.

BigEarthNet ships as one folder per patch containing per-band GeoTIFFs
(S2: B01..B12, B8A; S1: VV, VH) plus a `<patch_name>_labels_metadata.json`
with the real CORINE land-cover multi-hot labels for that patch. There is
no native "question/answer" pair in the source data, so this adapter
derives a real (not fabricated) captioning-style sample directly from the
actual annotation file: "What land cover classes are present in this
patch?" -> a comma-separated list of the patch's real labels.

Expected layout (as distributed by BigEarthNet):
    root_dir/<patch_name>/<patch_name>_B04.tif
    root_dir/<patch_name>/<patch_name>_labels_metadata.json
"""
from __future__ import annotations

import json
from pathlib import Path

from ml.datasets.base import BaseDatasetAdapter, VQASample

_S2_RGB_BANDS = ("B04", "B03", "B02")
_S1_BANDS = ("VV", "VH")


class BigEarthNetAdapter(BaseDatasetAdapter):
    dataset_name = "BigEarthNet"

    def __init__(self, root_dir: str, modality: str = "multispectral") -> None:
        super().__init__(root_dir)
        self.modality = modality
        self._patch_dirs = sorted(p for p in self.root_dir.iterdir() if p.is_dir())
        if not self._patch_dirs:
            raise FileNotFoundError(
                f"No patch directories found under '{self.root_dir}'. Expected one "
                "subdirectory per BigEarthNet patch."
            )

    def __len__(self) -> int:
        return len(self._patch_dirs)

    def _band_paths(self, patch_dir: Path) -> dict[str, str]:
        bands = _S1_BANDS if self.modality == "sar" else _S2_RGB_BANDS
        paths = {}
        for band in bands:
            candidate = patch_dir / f"{patch_dir.name}_{band}.tif"
            if candidate.exists():
                paths[band] = str(candidate)
        return paths

    def __getitem__(self, index: int) -> VQASample:
        patch_dir = self._patch_dirs[index]
        label_path = patch_dir / f"{patch_dir.name}_labels_metadata.json"
        if not label_path.exists():
            raise FileNotFoundError(f"Missing labels metadata file: {label_path}")

        with open(label_path, encoding="utf-8") as f:
            labels_metadata = json.load(f)
        labels = labels_metadata.get("labels", [])

        band_paths = self._band_paths(patch_dir)
        primary_band_path = next(iter(band_paths.values()), "")

        return VQASample(
            image_path=primary_band_path,
            question="What land cover classes are present in this patch?",
            answer=", ".join(labels) if labels else "No labels recorded for this patch.",
            task="captioning",
            metadata={"patch_name": patch_dir.name, "band_paths": band_paths, "labels": labels},
        )
