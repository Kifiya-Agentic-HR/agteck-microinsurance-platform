from logging.config import fileConfig
import os

from sqlalchemy import engine_from_config, pool
from alembic import context

# Import your settings to load the database URL
from src.core.config import settings

# -----------------------------
# Load Alembic config
# -----------------------------
config = context.config

# Dynamically set the DB URL from environment variable or fallback to config
db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
config.set_main_option("sqlalchemy.url", db_url)

# Setup loggers from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# -----------------------------
# Import your model metadata
# -----------------------------
from src.database.db import Base
from src.database.models.policy import *  # Ensures all models are imported

# This lets Alembic generate migrations by comparing models vs DB
target_metadata = Base.metadata
# -----------------------------
# Offline migration mode
# -----------------------------
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode without DB connection."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

# -----------------------------
# Online migration mode
# -----------------------------
def run_migrations_online() -> None:
    """Run migrations in 'online' mode with DB engine."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()

# -----------------------------
# Entry point
# -----------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
