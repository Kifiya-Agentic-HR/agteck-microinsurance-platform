#!/bin/sh

# Start the FastAPI application
exec uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
