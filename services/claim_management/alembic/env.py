from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os

# ✅ Load environment variables from .env
from dotenv import load_dotenv
load_dotenv()

# ✅ Alembic Config object
config = context.config

# ✅ Get DB URL safely
db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise ValueError("DATABASE_URL environment variable is not set.")
config.set_main_option("sqlalchemy.url", db_url)

# ✅ Configure logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ✅ Import models and set target_metadata for autogenerate
from src.database.models.claim_management import Base, Claim
target_metadata = Base.metadata

# --- Offline migration mode ---
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode without DB engine."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

# --- Online migration mode ---
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

# ✅ Execute the correct mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
