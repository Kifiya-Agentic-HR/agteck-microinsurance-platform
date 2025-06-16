"""Add company_id to policy_detail

Revision ID: 507c03c3c1b0
Revises: 535532062c79
Create Date: 2025-06-16 21:58:03.661537

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '23a3a15e98cc'
down_revision: Union[str, None] = '535532062c79'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema by adding company_id column to policy_detail."""
    op.add_column('policy_detail', sa.Column('company_id', sa.Integer(), nullable=False))


def downgrade() -> None:
    """Downgrade schema by removing company_id column from policy_detail."""
    op.drop_column('policy_detail', 'company_id')
