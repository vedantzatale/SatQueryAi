"""Convert a PEFT/LoRA-wrapped InternVL3 training checkpoint into a plain
`InternVLChatModel` checkpoint that `AutoModel.from_pretrained` can load.

Why this is needed: a LoRA fine-tune saved without calling `merge_and_unload()`
keeps the PEFT wrapper in the key names --

    language_model.base_model.model.model.layers.0.mlp.down_proj.base_layer.weight
    language_model.base_model.model.model.layers.0.mlp.down_proj.lora_A.default.weight
    language_model.base_model.model.model.layers.0.mlp.down_proj.lora_B.default.weight

while the architecture expects:

    language_model.model.layers.0.mlp.down_proj.weight

Loading the unconverted file "succeeds" but silently leaves every language-model
tensor randomly initialized (transformers reports them as MISSING), so the model
emits gibberish. This script rewrites the keys and folds the LoRA delta into the
base weight: W = W_base + (B @ A) * (alpha / r).

Usage:
    python -m ml.inference.convert_internvl_peft --src <in_dir> --dst <out_dir>
"""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

import torch
from safetensors import safe_open
from safetensors.torch import save_file

_PEFT_INFIX = "base_model.model."
# Files the runtime needs alongside the weights (architecture code, tokenizer,
# preprocessor). Training bookkeeping (trainer_state, training_args) is skipped.
_SIDECAR_SUFFIXES = (".py", ".json", ".txt")
_SKIP_SIDECARS = {"trainer_state.json", "train_results.json", "model.safetensors.index.json"}


def convert(src: Path, dst: Path, alpha: float | None, rank_override: int | None) -> None:
    weights_path = src / "model.safetensors"
    if not weights_path.exists():
        raise FileNotFoundError(f"No model.safetensors in {src}")

    dst.mkdir(parents=True, exist_ok=True)

    with safe_open(str(weights_path), "pt") as f:
        keys = list(f.keys())
        tensors = {k: f.get_tensor(k) for k in keys}

    # Group LoRA triples by their target module prefix.
    lora_targets: dict[str, dict[str, str]] = {}
    for k in keys:
        for part in ("lora_A", "lora_B", "base_layer"):
            marker = f".{part}."
            if marker in k:
                prefix = k.split(marker)[0]
                lora_targets.setdefault(prefix, {})[part] = k
                break

    out: dict[str, torch.Tensor] = {}
    merged = 0
    zero_delta = 0

    for k in keys:
        if ".lora_A." in k or ".lora_B." in k:
            continue  # folded into the base weight below

        if ".base_layer." in k:
            prefix, tail = k.split(".base_layer.", 1)
            entry = lora_targets.get(prefix, {})
            weight = tensors[k].float()

            a_key, b_key = entry.get("lora_A"), entry.get("lora_B")
            if tail == "weight" and a_key and b_key:
                a = tensors[a_key].float()  # (r, in)
                b = tensors[b_key].float()  # (out, r)
                r = rank_override or a.shape[0]
                scale = (alpha if alpha is not None else 2.0 * r) / r
                delta = (b @ a) * scale
                if float(delta.abs().max()) == 0.0:
                    zero_delta += 1
                weight = weight + delta
                merged += 1
            new_key = f"{prefix}.{tail}"
        else:
            new_key = k
            weight = tensors[k]

        new_key = new_key.replace(_PEFT_INFIX, "", 1) if _PEFT_INFIX in new_key else new_key
        out[new_key] = weight.contiguous().to(torch.float32)

    save_file(out, str(dst / "model.safetensors"), metadata={"format": "pt"})

    for item in src.iterdir():
        if item.is_file() and item.name.endswith(_SIDECAR_SUFFIXES) and item.name not in _SKIP_SIDECARS:
            if item.name != "model.safetensors":
                shutil.copy2(item, dst / item.name)

    print(f"tensors in:  {len(keys)}")
    print(f"tensors out: {len(out)}")
    print(f"LoRA modules merged: {merged}")
    if merged and zero_delta == merged:
        print(
            f"WARNING: all {merged} LoRA deltas were exactly zero -- this adapter is a "
            "no-op and the result is identical to the base model. That is what a "
            "train_loss of 0.0 means: the run produced no gradient signal."
        )
    print(f"written to: {dst}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--src", required=True)
    ap.add_argument("--dst", required=True)
    ap.add_argument("--alpha", type=float, default=None, help="LoRA alpha (default: 2*r)")
    ap.add_argument("--rank", type=int, default=None, help="Override inferred LoRA rank")
    args = ap.parse_args()
    convert(Path(args.src), Path(args.dst), args.alpha, args.rank)


if __name__ == "__main__":
    main()
