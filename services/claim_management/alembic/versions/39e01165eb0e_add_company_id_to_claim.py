"""add company_id to claim

Revision ID: 39e01165eb0e
Revises: f04cbd635bd7
Create Date: 2025-06-13 11:09:22.440537

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '39e01165eb0e'
down_revision: Union[str, None] = 'f04cbd635bd7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'claim',
        sa.Column('company_id', sa.Integer(), nullable=False)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('claim', 'company_id')