"""Optional: record a real evaluation result into the backend's
evaluation_runs table via its public HTTP API. Deliberately does not
import backend/app directly -- ml/ stays isolated from the serving
path; this only ever talks to the same API a frontend would.
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request


def post_evaluation_result(api_base_url: str, result: dict) -> None:
    body = {
        "dataset": result["dataset"],
        "task": result["task"],
        "metrics": result["metrics"],
        "model_id": result["model_id"],
        "model_version": result["model_version"],
        "sample_count": result["sample_count"],
    }
    request = urllib.request.Request(
        f"{api_base_url.rstrip('/')}/evaluation-runs",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            print(f"Recorded evaluation run: {response.read().decode('utf-8')}")
    except urllib.error.URLError as exc:
        print(f"Could not record evaluation run to {api_base_url}: {exc}", file=sys.stderr)
