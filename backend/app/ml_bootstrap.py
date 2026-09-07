"""Makes the repo-root `ml/` package importable from the backend.

`ml/` is not installed as a package (no ml/pyproject.toml) — it's shared
via a bind mount in docker-compose.yml (`./ml:/app/ml`, alongside the
backend's own `./backend:/app`), and via being a plain sibling directory
of `backend/` in local dev. Neither layout puts it on sys.path by default,
so real model adapters call `ensure_ml_importable()` once before doing
`from ml.inference... import ...`.
"""
from __future__ import annotations

import sys
from pathlib import Path

_done = False


def ensure_ml_importable() -> None:
    global _done
    if _done:
        return
    here = Path(__file__).resolve()
    candidates = [
        here.parents[1],  # backend/app/ml_bootstrap.py -> backend  (local dev: backend/../ml == repo_root/ml)
        Path("/app"),      # docker: /app/ml mounted alongside /app/app
    ]
    for candidate in candidates:
        repo_root = candidate.parent if candidate.name == "backend" else candidate
        if (repo_root / "ml" / "__init__.py").exists():
            path_str = str(repo_root)
            if path_str not in sys.path:
                sys.path.insert(0, path_str)
            _done = True
            return
