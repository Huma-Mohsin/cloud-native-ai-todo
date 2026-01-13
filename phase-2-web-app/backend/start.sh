#!/bin/sh
# Railway startup script with proper PORT handling

# Railway expects port 8000 based on dashboard
PORT=${PORT:-8000}

echo "Starting uvicorn on port $PORT..."

# Start uvicorn on the correct port
exec uvicorn src.main:app --host 0.0.0.0 --port 8000
