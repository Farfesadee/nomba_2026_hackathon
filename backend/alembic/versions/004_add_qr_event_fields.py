"""Add QR delivery, style, and message fields to events table

Revision ID: 004_add_qr_fields
Revises: 003_add_trial_enforcement
Create Date: 2026-06-10 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '004_add_qr_fields'
down_revision = '003_add_trial_enforcement'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('events', sa.Column('qr_delivery', sa.String(), nullable=True))
    op.add_column('events', sa.Column('qr_style', sa.String(), nullable=True))
    op.add_column('events', sa.Column('qr_message', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('events', 'qr_message')
    op.drop_column('events', 'qr_style')
    op.drop_column('events', 'qr_delivery')
