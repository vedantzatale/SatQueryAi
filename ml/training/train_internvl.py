"""Training entry point for adapting InternVL3-1B to remote sensing via
LoRA/QLoRA. This is deliberately separate from the FastAPI serving path
(app/model_adapters/) -- training code never runs inside a request.

This script loads real config and a real dataset adapter and reports
exactly what it would do next; it does NOT run a fabricated training
loop or claim a model was trained when `torch`/`transformers`/`peft`
(the `[ml]` extra) aren't installed or no GPU is available. Install the
`ml` extra (`pip install -e ".[ml]"` from backend/, or add torch/
transformers/peft to this environment) and provide real weights before
using this for an actual training run.

Usage:
    python -m ml.training.train_internvl --config ml/training/configs/internvl_rs.yaml
"""
from __future__ import annotations

import argparse
import importlib
import sys
from pathlib import Path

import yaml

_DATASET_ADAPTERS = {
    "bigearthnet": "ml.datasets.bigearthnet.BigEarthNetAdapter",
    "vrsbench": "ml.datasets.vrsbench.VRSBenchAdapter",
    "rsvqa": "ml.datasets.rsvqa.RSVQAAdapter",
    "cdvqa": "ml.datasets.cdvqa.CDVQAAdapter",
}


def load_config(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_dataset(dataset_config: dict):
    adapter_path = _DATASET_ADAPTERS.get(dataset_config["adapter"])
    if adapter_path is None:
        raise ValueError(f"Unknown dataset adapter '{dataset_config['adapter']}'.")
    module_path, class_name = adapter_path.rsplit(".", 1)
    module = importlib.import_module(module_path)
    adapter_class = getattr(module, class_name)
    kwargs = {k: v for k, v in dataset_config.items() if k not in ("adapter", "root_dir")}
    return adapter_class(dataset_config["root_dir"], **kwargs)


def main() -> None:
    parser = argparse.ArgumentParser(description="Adapt InternVL3-1B for remote sensing.")
    parser.add_argument("--config", required=True)
    args = parser.parse_args()

    config = load_config(args.config)
    print(f"Loaded training config from {args.config}:")
    print(f"  base_model={config['base_model']}")
    print(f"  lora.enabled={config['lora']['enabled']}")

    try:
        dataset = load_dataset(config["dataset"])
    except FileNotFoundError as exc:
        print(f"\nDataset not available: {exc}", file=sys.stderr)
        print("See docs/DATASETS.md for how to obtain and place this dataset.", file=sys.stderr)
        sys.exit(1)

    print(f"Dataset '{dataset.dataset_name}' loaded: {len(dataset)} samples.")

    try:
        import torch  # noqa: F401
        import transformers  # noqa: F401
        import peft  # noqa: F401
    except ImportError:
        print(
            "\ntorch/transformers/peft are not installed in this environment "
            "(install the backend's `ml` extra: pip install -e \".[ml]\"). "
            "Config and dataset loading succeeded; the actual LoRA fine-tuning "
            "loop is not implemented in this prototype build -- this script "
            "stops here rather than fabricating a completed training run.",
            file=sys.stderr,
        )
        sys.exit(2)

    Path(config["output_dir"]).mkdir(parents=True, exist_ok=True)
    print(
        "torch/transformers/peft ARE available in this environment, but the "
        "training loop itself (data collation, LoRA injection, optimizer step, "
        "checkpointing) is not implemented in this prototype -- see "
        "docs/MODELS.md 'Real-model integration path' for what's needed next."
    )


if __name__ == "__main__":
    main()
