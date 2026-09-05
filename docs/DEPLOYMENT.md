# Deployment

## Local development (verified in this build)

SQLite + local filesystem storage + inline (in-process) task execution — no Docker, no
Redis, no MinIO, no Postgres required. This is `DEMO_MODE=true` with the defaults in
`.env.example`. See the README for exact commands. This is the path actually exercised by
`backend/tests/` and the Playwright smoke test in this session.

## Docker Compose (written, not verified against a live daemon this session)

`docker-compose.yml` brings up `postgres` (PostGIS image), `redis`, `minio`, `backend`,
`worker` (Celery), and `frontend`. To switch the backend from SQLite/local/inline to this
stack, override in `.env` (or via `docker-compose.yml`'s `environment:` blocks, already
set there):

```
DATABASE_URL=postgresql+psycopg2://satquery:satquery@postgres:5432/satquery
REDIS_URL=redis://redis:6379/0
STORAGE_BACKEND=minio
MINIO_ENDPOINT=minio:9000
TASK_BACKEND=celery
```

Run `alembic upgrade head` once against the Postgres container — the second migration
(`0002_postgis_geometry`) adds real PostGIS geometry columns + GIST indexes and only
executes its DDL when the target dialect is Postgres.

**Docker was reported installed partway through this build session but never became
reachable from the shell used to build it** (a PATH refresh issue, not a code issue) — the
compose files were written to the architecture in `docs/ARCHITECTURE.md` but not run
end-to-end. Verify with `docker compose config` then `docker compose up --build` before
relying on this path.

## On-premise / air-gapped deployment

No component requires a public-cloud service to function:

- `SatelliteDataProvider` implementations are the only thing that call external HTTP APIs
  (Copernicus/USGS), and the system runs fully without them via the mock/demo provider.
- `ObjectStorageBackend` supports a local filesystem or any S3-compatible endpoint reachable
  on an internal network (MinIO or otherwise).
- `BaseModelAdapter` implementations load weights from a local path (`*_MODEL_PATH`); no
  model call requires internet access once weights are present.

This is what makes an ISRO/government-network/private-cloud deployment possible without
rearchitecting — only configuration changes.

## Kubernetes / Helm

Not created in this build session. `docker-compose.yml`'s service list (postgres, redis,
minio, backend, worker, frontend) is the direct template for a future Helm chart's
Deployments/StatefulSets — flagged as a follow-up in `docs/DEVELOPMENT.md`, not fabricated
here.
