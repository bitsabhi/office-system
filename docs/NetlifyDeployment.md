#!/bin/bash

# Office System Netlify Deployment Script
# This script prepares and deploys the frontend to Netlify
# and guides you through backend deployment to Render.com

echo "======================================================"
echo "  Office System - Deployment Script                   "
echo "======================================================"

echo "1. Preparing frontend for deployment..."

# Navigate to frontend directory
cd src/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  npm install --save-dev @types/node
fi

# Create netlify.toml file
cat > netlify.toml << 'EOF'
[build]
  base = "."
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.render.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/ws/*"
  to = "wss://your-backend-url.render.com/ws/:splat"
  status = 101
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF

# Update Dashboard.tsx to handle production URLs
if [ -f "src/components/Dashboard.tsx" ]; then
  echo "Updating Dashboard component for production..."
  sed -i.bak 's|baseUrl = "ws://localhost:8000"|baseUrl = window.location.origin.replace("http", "ws")|g' src/components/Dashboard.tsx
elif [ -f "src/src/components/Dashboard.tsx" ]; then
  echo "Updating Dashboard component for production..."
  sed -i.bak 's|baseUrl = "ws://localhost:8000"|baseUrl = window.location.origin.replace("http", "ws")|g' src/src/components/Dashboard.tsx
fi

# Build the frontend
echo "Building frontend..."
npm run build

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
  echo "Netlify CLI not found. Installing..."
  npm install -g netlify-cli
fi

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod

echo ""
echo "======================================================"
echo "  Backend Deployment Instructions (Render.com)        "
echo "======================================================"
echo ""
echo "1. Create a new Web Service on Render.com"
echo "2. Connect your GitHub repository"
echo "3. Configure as follows:"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: gunicorn src.backend.main:app -k uvicorn.workers.UvicornWorker"
echo "   - Add Environment Variable: PYTHON_VERSION=3.9"
echo ""
echo "4. After deployment, update your netlify.toml redirects with your Render.com URL"
echo "5. Redeploy frontend with: netlify deploy --prod"
echo ""
echo "======================================================"
echo "  Deployment Complete!                                "
echo "======================================================"
