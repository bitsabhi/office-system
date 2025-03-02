#!/bin/bash

echo "Stopping Office System..."

# Stop backend
if [ -f "src/system.pid" ]; then
  BACKEND_PID=$(cat "src/system.pid")
  if ps -p $BACKEND_PID > /dev/null; then
    echo "Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID
    rm "src/system.pid"
  else
    echo "Backend is not running"
    rm "src/system.pid"
  fi
else
  echo "No backend PID file found"
fi

# Stop frontend
if [ -f "logs/frontend.pid" ]; then
  FRONTEND_PID=$(cat "logs/frontend.pid")
  if ps -p $FRONTEND_PID > /dev/null; then
    echo "Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID
    rm "logs/frontend.pid"
  else
    echo "Frontend is not running"
    rm "logs/frontend.pid"
  fi
else
  echo "No frontend PID file found"
fi

echo "Office System stopped"
