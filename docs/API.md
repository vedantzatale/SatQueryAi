# API

Base path: `/api/v1`. Interactive OpenAPI docs at `/docs` when the backend is running
(FastAPI default). All errors return `{"detail": "<safe user-facing message>"}`; technical
detail is only ever in structured logs.

| Method & Path | Purpose |
|---|---|
| `POST /sessions` | Create a chat session |
| `GET /sessions` | List sessions, newest first |
| `GET /sessions/{id}` | Session detail + full message history |
| `POST /images/upload?session_id=` | Upload + validate an image (multipart `file`) |
| `GET /images/{id}` | Image metadata (modality, CRS, dimensions, etc.) |
| `POST /query` | `{session_id, text, image_ids}` → runs the full pipeline, persists chat messages, returns `{execution_id, status}` |
| `GET /query/{id}` | Raw stored query text + detected language |
| `POST /analysis` | `{session_id?, query_text, image_ids}` → same pipeline as `/query` without chat persistence, returns `{execution_id, status}` |
| `GET /analysis/{id}` | Full `ExecutionResult` (answer, evidence, confidence, provenance, warnings) |
| `GET /analysis/{id}/evidence` | Just the evidence list |
| `GET /analysis/{id}/transparency` | "How Was This Analyzed?" — task, model, provenance, confidence, processing steps. Never chain-of-thought. |
| `GET /analysis/{id}/report` | Generates and returns a PDF report (ReportLab), 409 if the execution isn't `completed` |
| `GET /analysis/{id}/geojson` | Generates and returns a GeoJSON `FeatureCollection` of AOI + spatial evidence, reprojected to EPSG:4326 |
| `POST /satellite/search` | `{location, date_from, date_to, modality}` → ranked scene candidates + provider statuses |
| `POST /satellite/retrieve` | `{provider, scene_id}` → direct download (mainly for debugging; the orchestrated retrieval path is internal to `/query`/`/analysis`) |
| `GET /satellite/providers/status` | Availability of each configured provider |
| `GET /models` | Registry listing (capability, modalities, version, enabled) |
| `GET /models/{id}/health` | `healthy` / `degraded` / `unavailable` + whether it's a mock |
| `GET /system/health` | Database/Redis/storage component health + `demo_mode` flag |
| `GET /storage/{key}` | Serves a stored evidence/report object (local backend passthrough) |

## Example: single-image VQA

```bash
SESSION=$(curl -s -X POST localhost:8000/api/v1/sessions -d '{}' -H 'Content-Type: application/json' | jq -r .id)
IMAGE=$(curl -s -X POST "localhost:8000/api/v1/images/upload?session_id=$SESSION" -F file=@data/demo/single/optical/sample_optical.tif | jq -r .image_id)
curl -s -X POST localhost:8000/api/v1/query -H 'Content-Type: application/json' \
  -d "{\"session_id\":\"$SESSION\",\"text\":\"Where is the water?\",\"image_ids\":[\"$IMAGE\"]}"
```
