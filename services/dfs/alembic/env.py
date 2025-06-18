from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv
import os

# --- Load environment variables from the .env file ---
# This must be done early before loading config
load_dotenv(dotenv_path=os.path.abspath(os.path.join(os.path.dirname(__file__), '../.env')))

# --- Import application settings AFTER loading .env ---
from src.core.config import settings
from src.database.db import Base
from src.database.models.enrolement import Enrolement
from src.database.models.customer import Customer  # Add all your models here

# --- Alembic Config ---
config = context.config

# Set database URL from environment variable or fallback to settings
db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
config.set_main_option("sqlalchemy.url", db_url)

# --- Set up logging ---
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- Metadata for autogenerate support ---
target_metadata = Base.metadata

# --- Migration runners ---
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
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


# --- Execute the appropriate mode ---
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
