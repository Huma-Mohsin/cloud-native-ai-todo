#!/bin/sh
# Railway startup script with proper PORT handling

# Use Railway's PORT environment variable (Railway sets this automatically)
# No default needed - Railway will always set PORT

echo "Starting uvicorn on port $PORT..."

# Start uvicorn
exec uvicorn src.main:app --host 0.0.0.0 --port "$PORT"
