"""Link messages to the execution that produced them, so reopening a chat
session can restore the full result (evidence, confidence, transparency,
map) for each past assistant reply, not just its text.

Revision ID: 0003_message_execution_link
Revises: 0002_postgis_geometry
Create Date: 2026-09-07

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003_message_execution_link"
down_revision: Union[str, None] = "0002_postgis_geometry"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("messages") as batch_op:
        batch_op.add_column(sa.Column("execution_id", sa.String(), nullable=True))
        batch_op.create_foreign_key(
            "fk_messages_execution_id", "executions", ["execution_id"], ["id"]
        )


def downgrade() -> None:
    with op.batch_alter_table("messages") as batch_op:
        batch_op.drop_constraint("fk_messages_execution_id", type_="foreignkey")
        batch_op.drop_column("execution_id")
