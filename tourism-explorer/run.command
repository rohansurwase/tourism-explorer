#!/bin/bash
cd "$(dirname "$0")"

echo "=================================================="
echo "🚀 Starting hyperDart Tourism Explorer..."
echo "=================================================="

# Free port 3001 if occupied
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Use the working node binary
if [ -x "/usr/local/bin/node" ]; then
  NODE_BIN="/usr/local/bin/node"
else
  NODE_BIN="node"
fi

echo "Using Node runtime: $($NODE_BIN -v)"
echo "Starting server on http://localhost:3001..."

$NODE_BIN server/index.js &
SERVER_PID=$!

sleep 1.2
open "http://localhost:3001" 2>/dev/null || open "preview.html"

echo ""
echo "✔ Server is live at http://localhost:3001"
echo "Press Ctrl+C to stop the server."
wait $SERVER_PID
