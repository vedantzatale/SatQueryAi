"""Add real PostGIS geometry columns + GIST spatial indexes, derived from
the portable GeoJSON JSON columns. This migration is a no-op on SQLite
(local dev) -- it only runs its DDL when the target database is Postgres,
so production spatial queries can use PostGIS directly while the ORM
itself stays database-agnostic.

Revision ID: 0002_postgis_geometry
Revises: ee4074e6ef1b
Create Date: 2026-09-05

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op

revision: str = "0002_postgis_geometry"
down_revision: Union[str, None] = "ee4074e6ef1b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _is_postgres() -> bool:
    bind = op.get_bind()
    return bind.dialect.name == "postgresql"


def upgrade() -> None:
    if not _is_postgres():
        return

    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.execute(
        "ALTER TABLE image_metadata ADD COLUMN bounds_geom geometry(Polygon, 4326)"
    )
    op.execute(
        """
        UPDATE image_metadata
        SET bounds_geom = ST_SetSRID(ST_GeomFromGeoJSON(bounds_geojson::text), 4326)
        WHERE bounds_geojson IS NOT NULL
        """
    )
    op.execute("CREATE INDEX ix_image_metadata_bounds_geom ON image_metadata USING GIST (bounds_geom)")

    op.execute(
        "ALTER TABLE satellite_scenes ADD COLUMN bbox_geom geometry(Polygon, 4326)"
    )
    op.execute(
        """
        UPDATE satellite_scenes
        SET bbox_geom = ST_SetSRID(ST_GeomFromGeoJSON(bbox_geojson::text), 4326)
        WHERE bbox_geojson IS NOT NULL
        """
    )
    op.execute("CREATE INDEX ix_satellite_scenes_bbox_geom ON satellite_scenes USING GIST (bbox_geom)")

    op.execute(
        "ALTER TABLE task_plans ADD COLUMN location_geom geometry(Geometry, 4326)"
    )
    op.execute(
        """
        UPDATE task_plans
        SET location_geom = ST_SetSRID(ST_GeomFromGeoJSON(location_json->>'polygon'), 4326)
        WHERE location_json IS NOT NULL AND location_json->>'polygon' IS NOT NULL
        """
    )
    op.execute("CREATE INDEX ix_task_plans_location_geom ON task_plans USING GIST (location_geom)")


def downgrade() -> None:
    if not _is_postgres():
        return
    op.execute("DROP INDEX IF EXISTS ix_task_plans_location_geom")
    op.execute("ALTER TABLE task_plans DROP COLUMN IF EXISTS location_geom")
    op.execute("DROP INDEX IF EXISTS ix_satellite_scenes_bbox_geom")
    op.execute("ALTER TABLE satellite_scenes DROP COLUMN IF EXISTS bbox_geom")
    op.execute("DROP INDEX IF EXISTS ix_image_metadata_bounds_geom")
    op.execute("ALTER TABLE image_metadata DROP COLUMN IF EXISTS bounds_geom")
