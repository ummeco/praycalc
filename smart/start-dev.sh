#!/usr/bin/env bash
# Start the praycalc-smart backend in development mode with .env.local loaded.
# Usage: ./start-dev.sh
set -a
source "$(dirname "$0")/.env.local"
set +a
exec npx tsx watch src/index.ts
