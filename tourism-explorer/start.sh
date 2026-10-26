#!/bin/bash
cd "$(dirname "$0")"

# Free port 3001 if occupied
lsof -ti:3001 | xargs kill -9 2>/dev/null

if [ -x "/usr/local/bin/node" ]; then
  NODE_BIN="/usr/local/bin/node"
else
  NODE_BIN="node"
fi

echo "🚀 Starting Tourism Explorer using $NODE_BIN ($($NODE_BIN -v))..."
$NODE_BIN server/index.js &
SERVER_PID=$!

sleep 1
open "http://localhost:3001" 2>/dev/null || open "preview.html"

echo "✔ Live at http://localhost:3001"
wait $SERVER_PID
