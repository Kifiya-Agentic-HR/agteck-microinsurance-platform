"""Create Policy and Policy Detail table

Revision ID: 535532062c79
Revises: 
Create Date: 2025-04-28 16:23:26.993666

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '535532062c79'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('policy',
    sa.Column('policy_id', sa.Integer(), nullable=False),
    sa.Column('enrollment_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('ic_company_id', sa.Integer(), nullable=False),
    sa.Column('policy_no', sa.String(length=50), nullable=False),
    sa.Column('fiscal_year', sa.String(length=4), nullable=False),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.CheckConstraint("status IN ('pending', 'approved', 'rejected')", name='ck_policy_status'),
    sa.PrimaryKeyConstraint('policy_id'),
    sa.UniqueConstraint('policy_no')
    )
    op.create_index(op.f('ix_policy_policy_id'), 'policy', ['policy_id'], unique=False)
    op.create_table('policy_detail',
    sa.Column('policy_detail_id', sa.Integer(), nullable=False),
    sa.Column('policy_id', sa.Integer(), nullable=False),
    sa.Column('period', sa.Integer(), nullable=False),
    sa.Column('period_sum_insured', sa.Numeric(precision=14, scale=2), nullable=False),
    sa.ForeignKeyConstraint(['policy_id'], ['policy.policy_id'], ),
    sa.PrimaryKeyConstraint('policy_detail_id')
    )
    op.create_index(op.f('ix_policy_detail_policy_detail_id'), 'policy_detail', ['policy_detail_id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_policy_detail_policy_detail_id'), table_name='policy_detail')
    op.drop_table('policy_detail')
    op.drop_index(op.f('ix_policy_policy_id'), table_name='policy')
    op.drop_table('policy')
    # ### end Alembic commands ###
