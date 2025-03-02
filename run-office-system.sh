#!/bin/bash

echo "Starting Office System..."

# Create required directories
mkdir -p uploads analytics_data logs

# Check if backend is already running
if [ -f "src/system.pid" ]; then
  PID=$(cat "src/system.pid")
  if ps -p $PID > /dev/null; then
    echo "Backend is already running with PID: $PID"
    echo "To restart, kill the process first: kill $PID"
    exit 1
  else
    echo "Removing stale PID file"
    rm "src/system.pid"
  fi
fi

# Use existing virtual environment and ensure dependencies
source venv/bin/activate
echo "Checking dependencies..."
pip install -q fastapi==0.115.11 starlette==0.46.0 pandas uvicorn websockets python-multipart psutil sqlalchemy

# Start backend server with detailed logging
echo "Starting backend server..."
cd src/backend
python main.py > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

echo $BACKEND_PID > src/system.pid
echo "Backend started with PID: $BACKEND_PID"

# Check if backend started successfully and provide detailed error info
sleep 2
if ps -p $BACKEND_PID > /dev/null; then
  echo "Backend is running successfully"
else
  echo "Backend failed to start. Here's the error:"
  cat logs/backend.log
  exit 1
fi

# Start frontend dev server
echo "Starting frontend dev server..."
cd src/frontend
# Only install if needed
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"
echo $FRONTEND_PID > ../../logs/frontend.pid
cd ../..

echo "Office System is now running!"
echo "- Backend API: http://localhost:8000"
echo "- Frontend: http://localhost:5174"
echo "- Log files: logs/backend.log and logs/frontend.log"

# Create stop script
cat > stop-office-system.sh << 'STOPEOF'
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
STOPEOF

chmod +x stop-office-system.sh
