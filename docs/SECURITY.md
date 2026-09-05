# Security

## Implemented

- **Filename sanitization**: `app/services/image_ingestion.py::sanitize_filename` strips
  any path component and any character outside a small safe set before an uploaded
  filename ever touches the filesystem or a storage key.
- **Path traversal protection**: `LocalFilesystemStorage._path_for` strips `..` from
  storage keys and resolves everything under a fixed root; the API never accepts a raw
  filesystem path from a client.
- **Upload size limits**: `MAX_UPLOAD_SIZE_MB` (default 200MB), enforced in
  `app/api/v1/images.py` before the file is read into memory.
- **Extension/MIME validation**: `InputValidationService` only accepts
  `.tif/.tiff/.png/.jpg/.jpeg`; anything else is rejected before any parsing happens.
- **No SQL injection surface**: all queries go through SQLAlchemy's ORM (parameterized).
  The one place raw SQL runs (`alembic/versions/0002_postgis_geometry.py`) takes no user
  input and only executes on Postgres.
- **CORS**: configurable via `CORS_ALLOWED_ORIGINS` (default `http://localhost:3000`),
  applied in `app/main.py`.
- **No secrets in git**: `.env` is gitignored; `.env.example` ships only empty
  placeholders. `JWT_SECRET` exists as a config placeholder for future auth middleware.
- **Uploaded files are never executed**: they are only opened by rasterio/GDAL/PIL for
  read-only raster inspection.

## Not yet implemented (documented, not fabricated as done)

- **Authentication**: there is no login/session-token middleware. The `User` model and
  `JWT_SECRET` config exist so auth can be added without a schema change, but every
  endpoint is currently open. Do not deploy this build on an untrusted network as-is.
- **Rate limiting**: not implemented.
- **Role-based access control**: not implemented (no roles exist yet).
- **Audit logging of security events** (failed auth, rate-limit hits): N/A until the above
  exist; the audit trail that does exist (`app/audit/service.py`) covers analysis
  execution, not access control.

## Frontend dependency audit

`npm audit` reports a residual high-severity advisory in `postcss`, pulled in transitively
by Next.js 14.2.35's own bundled build tooling (`next/node_modules/postcss`), not by any
dependency this project added directly. It affects PostCSS's source-map handling during
local builds of trusted CSS, not runtime request handling — the practical exposure for this
build is low, but resolving it fully requires an upgrade to Next.js 15/16 (a breaking
change to the App Router APIs this frontend uses), which was out of scope for this pass.
Track this before a production deployment.
