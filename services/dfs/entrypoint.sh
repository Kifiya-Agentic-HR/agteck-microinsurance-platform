#!/bin/bash

set -e  # Exit on error

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting FastAPI server..."
exec uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
