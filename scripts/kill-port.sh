#!/bin/bash
# Kill process on specified port

PORT=${1:-3001}

echo "Checking for processes on port $PORT..."

PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
  echo "✅ No process found on port $PORT"
  exit 0
else
  echo "🔍 Found process $PID on port $PORT"
  echo "🔪 Killing process..."
  kill -9 $PID 2>/dev/null
  
  # Wait a moment for the port to be released
  sleep 1
  
  # Verify the port is free
  NEW_PID=$(lsof -ti:$PORT 2>/dev/null)
  if [ -z "$NEW_PID" ]; then
    echo "✅ Port $PORT is now free"
    exit 0
  else
    echo "❌ Failed to free port $PORT"
    exit 1
  fi
fi

# Made with Bob
