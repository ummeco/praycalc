#!/usr/bin/env bash
# deploy.sh — Deploy praycalc-smart to ummat-prod (159.69.190.92)
# Syncs code, rebuilds Docker image, restarts container on the ummat_network.
# Run from: praycalc/smart/
set -euo pipefail

SERVER="root@159.69.190.92"
REMOTE_DIR="/opt/ummat/smart"
IMAGE="praycalc-smart:latest"
CONTAINER="praycalc-smart"
NETWORK="ummat_network"
PORT="4010"

echo "→ Syncing smart server code to $SERVER..."
rsync -az --exclude node_modules --exclude dist --exclude .git \
  "$(dirname "$0")/" "$SERVER:$REMOTE_DIR/"

echo "→ Building Docker image on server..."
ssh "$SERVER" "
  cd $REMOTE_DIR && \
  docker build -t $IMAGE . 2>&1 | tail -8
"

echo "→ Restarting container..."
ssh "$SERVER" "
  docker stop $CONTAINER 2>/dev/null || true
  docker rm $CONTAINER 2>/dev/null || true
  docker run -d \
    --name $CONTAINER \
    --network $NETWORK \
    --restart unless-stopped \
    -p 127.0.0.1:$PORT:$PORT \
    \$(cat /opt/ummat/smart/.env.prod 2>/dev/null | sed 's/^/-e /' | tr '\n' ' ') \
    $IMAGE

  echo '→ Waiting for health check...'
  sleep 8
  docker inspect $CONTAINER --format '{{.State.Status}} ({{.State.Health.Status}})'
  curl -sf http://127.0.0.1:$PORT/health || echo 'Health endpoint not responding'
"

echo "✓ praycalc-smart deployed to $SERVER"
