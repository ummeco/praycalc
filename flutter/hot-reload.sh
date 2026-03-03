#!/bin/bash
# Trigger Flutter hot reload on the running web dev server.
# Usage: ./hot-reload.sh
# Requires run-web.sh to be running (which connects flutter run to /tmp/flutter-pipe).

PIPE=/tmp/flutter-pipe

if [ ! -p "$PIPE" ]; then
  echo "❌ Pipe $PIPE not found. Run ./run-web.sh first."
  exit 1
fi

printf 'r' > "$PIPE" &
echo "🔥 Hot reload triggered"
