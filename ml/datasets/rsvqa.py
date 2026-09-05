"""RSVQA adapter.

RSVQA (LR/HR variants) distributes separate JSON files for images,
questions, and answers, cross-referenced by numeric ids. This adapter
expects the standard RSVQA release layout (see docs/DATASETS.md):

    root_dir/images/<img_id>.tif
    root_dir/all_questions.json   # [{"id":..., "img_id":..., "question":...}]
    root_dir/all_answers.json     # [{"id":..., "question_id":..., "answer":...}]
"""
from __future__ import annotations

import json
from pathlib import Path

from ml.datasets.base import BaseDatasetAdapter, VQASample


class RSVQAAdapter(BaseDatasetAdapter):
    dataset_name = "RSVQA"

    def __init__(self, root_dir: str) -> None:
        super().__init__(root_dir)
        questions_path = self.root_dir / "all_questions.json"
        answers_path = self.root_dir / "all_answers.json"
        for path in (questions_path, answers_path):
            if not path.exists():
                raise FileNotFoundError(
                    f"Expected RSVQA file '{path}' not found. Download RSVQA per docs/DATASETS.md."
                )

        with open(questions_path, encoding="utf-8") as f:
            self._questions = json.load(f)
        with open(answers_path, encoding="utf-8") as f:
            answers = json.load(f)
        self._answers_by_question_id = {a["question_id"]: a["answer"] for a in answers}

    def __len__(self) -> int:
        return len(self._questions)

    def __getitem__(self, index: int) -> VQASample:
        q = self._questions[index]
        image_path = str(self.root_dir / "images" / f"{q['img_id']}.tif")
        answer = self._answers_by_question_id.get(q["id"], "")
        return VQASample(
            image_path=image_path,
            question=q["question"],
            answer=answer,
            task="vqa",
            metadata={"question_id": q["id"], "img_id": q["img_id"]},
        )
