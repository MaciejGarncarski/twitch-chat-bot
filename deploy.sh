#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$SCRIPT_DIR/backend"

cd "$COMPOSE_DIR"
docker compose down
docker compose build --pull
docker compose up -d --remove-orphans
