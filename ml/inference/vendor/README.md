# Vendored model architecture code

Pure architecture/definition code needed to load each checkpoint, copied
here (not pip-installed) because none of these projects ship as a
pip-installable package with a stable API. Weights themselves are never
committed — see `models/weights/` (gitignored) and `*_MODEL_PATH` in
`backend/app/core/config.py`.

| Directory | Source | License |
|---|---|---|
| `changeformer/` | https://github.com/wgcban/ChangeFormer | MIT (Chaminda Bandara) — see `changeformer/LICENSE` |
| `prithvi/` | https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M | Apache-2.0 (IBM/NASA) |
| `croma/` | https://github.com/antofuller/CROMA | MIT (Anthony Fuller) — see `croma/LICENSE` |

`croma/architecture.py` is adapted (not verbatim) from upstream's
`use_croma.py`: `PretrainedCROMA.__init__` is changed to load one flat
safetensors state dict instead of per-submodule `.pt` files, to match the
Hugging Face `PyTorchModelHubMixin` checkpoint format this project uses.
Every other class is copied unmodified.
