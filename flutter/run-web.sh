#!/bin/bash
# Start PrayCalc Flutter web dev server with hot reload support.
# Usage: ./run-web.sh
# Hot reload: echo 'r' > /tmp/flutter-pipe
# Hot restart: echo 'R' > /tmp/flutter-pipe
# Quit: echo 'q' > /tmp/flutter-pipe

PIPE=/tmp/flutter-pipe
PORT=9090
DIR="$(cd "$(dirname "$0")" && pwd)"

# Create pipe if it doesn't exist
[ -p "$PIPE" ] || mkfifo "$PIPE"

echo "🕌 PrayCalc web dev server starting..."
echo "   URL:  http://localhost:$PORT"
echo "   Pipe: $PIPE"
echo ""
echo "   Hot reload: echo 'r' > $PIPE"
echo "   Hot restart: echo 'R' > $PIPE"
echo ""

cd "$DIR"
exec flutter run -d chrome --web-port=$PORT < "$PIPE"
