#!/usr/bin/env bash
# Helper script to run local Postgres (if needed) and start the dev server in WSL.
# Usage: bash ./scripts/wsl-dev.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Project dir: $ROOT_DIR"

# Ensure Docker is available
if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found in PATH. Install Docker Desktop or docker in WSL." >&2
  exit 1
fi

CONTAINER_NAME=web-dev-postgres
EXISTS=$(docker ps -a --filter "name=$CONTAINER_NAME" --format "{{.Names}}") || true

if [ -z "$EXISTS" ]; then
  echo "Starting postgres container: $CONTAINER_NAME"
  docker run --name $CONTAINER_NAME -e POSTGRES_PASSWORD=pass -e POSTGRES_USER=dev -e POSTGRES_DB=dev -p 5432:5432 -d postgres:15
else
  RUNNING=$(docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}") || true
  if [ -z "$RUNNING" ]; then
    echo "Found existing container $CONTAINER_NAME but it's not running. Starting it..."
    docker start $CONTAINER_NAME
  else
    echo "Container $CONTAINER_NAME already running"
  fi
fi

export DATABASE_URL="postgresql://dev:pass@127.0.0.1:5432/dev"
echo "Using DATABASE_URL=$DATABASE_URL"

# Start dev server in background with logging if not already running
if [ -f dev.pid ]; then
  PID=$(cat dev.pid 2>/dev/null || true)
  if [ -n "$PID" ] && ps -p "$PID" >/dev/null 2>&1; then
    echo "Dev server appears to be already running (PID $PID). Tail the log with: tail -f dev.log"
    exit 0
  else
    rm -f dev.pid
  fi
fi

echo "Starting dev server (nohup => dev.log). This will run in background."
nohup npm run dev > dev.log 2>&1 &
echo $! > dev.pid
sleep 1
echo "Started (PID $(cat dev.pid)). Tailing log..."
tail -n 100 dev.log
