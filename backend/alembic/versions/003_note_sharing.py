"""Note sharing fields

Revision ID: 003
Revises: 002
Create Date: 2026-05-18

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("notes", sa.Column("is_public", sa.Boolean(), nullable=False, server_default="0"))
    op.add_column("notes", sa.Column("share_token", sa.String(length=64), nullable=True))
    op.create_index(op.f("ix_notes_share_token"), "notes", ["share_token"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_notes_share_token"), table_name="notes")
    op.drop_column("notes", "share_token")
    op.drop_column("notes", "is_public")
