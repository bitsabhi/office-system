# Office System Troubleshooting Guide

This guide covers common issues and their solutions when working with the Office System.

## WebSocket Connection Issues

### Symptoms
- "Connection lost. Attempting to reconnect..." messages in UI
- Real-time updates not working
- WebSocket errors in browser console

### Solutions

1. **Check Backend Server**
   ```bash
   # Verify backend is running
   ps aux | grep uvicorn
   
   # Check backend logs
   tail -f logs/backend.log
   ```

2. **CORS Issues**
   - Ensure CORS middleware is properly configured in `main.py`
   - Check that the frontend origin is allowed

3. **WebSocket Path Mismatch**
   - Verify WebSocket paths match between frontend and backend
   - Frontend should connect to `/ws/documents`, `/ws/analytics`, and `/ws/workflows`
   - Backend should implement those same endpoints

4. **Firewall or Proxy Issues**
   - Ensure port 8000 is open for WebSocket connections
   - If using a proxy, ensure it supports WebSocket forwarding

## Frontend Build Issues

### Symptoms
- TypeScript errors during build
- Missing dependencies errors
- Frontend not loading properly

### Solutions

1. **TypeScript Path Issues**
   ```bash
   # Install Node types
   npm install --save-dev @types/node
   
   # Fix tsconfig.json
   cat > tsconfig.json << 'EOF'
   {
     "compilerOptions": {
       "target": "ES2020",
       "useDefineForClassFields": true,
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "skipLibCheck": true,
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx",
       "strict": true,
       "noUnusedLocals": false,
       "noUnusedParameters": false,
       "noFallthroughCasesInSwitch": true
     },
     "include": ["src"],
     "references": [{ "path": "./tsconfig.node.json" }]
   }
   EOF
   ```

2. **Missing Dependencies**
   ```bash
   # Install dependencies
   npm install
   
   # Check for specific packages
   npm install react react-dom tailwindcss
   ```

3. **Vite Config Issues**
   ```bash
   # Update vite.config.ts
   cat > vite.config.ts << 'EOF'
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import * as path from 'path'  // Use * as path instead of direct import

   export default defineConfig({
     plugins: [react()],
     server: {
       proxy: {
         '/api': 'http://localhost:8000',
         '/ws': {
           target: 'ws://localhost:8000',
           ws: true
         }
       }
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, 'src')
       }
     }
   })
   EOF
   ```

## Backend Server Issues

### Symptoms
- Server fails to start
- Import errors
- Permission errors

### Solutions

1. **Python Import Errors**
   ```bash
   # Check Python path
   echo $PYTHONPATH
   
   # Start server with correct Python path
   PYTHONPATH=$PYTHONPATH:. python src/backend/main.py
   ```

2. **Missing Dependencies**
   ```bash
   # Install required packages
   pip install fastapi uvicorn websockets python-multipart psutil
   ```

3. **PID File Issues**
   ```bash
   # Check if PID file exists
   ls -l src/system.pid
   
   # Remove stale PID file if server isn't running
   rm src/system.pid
   ```

4. **Permission Problems**
   ```bash
   # Check permissions
   ls -l uploads/
   
   # Fix permissions
   chmod -R 755 uploads/
   ```

## Deployment Issues

### Symptoms
- Deployment fails
- Deployed app doesn't connect to backend
- Static files not loading

### Solutions

1. **Netlify Deployment**
   ```bash
   # Fix netlify.toml
   cat > netlify.toml << 'EOF'
   [build]
     base = "src/frontend"
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   EOF
   ```

2. **Backend URL Configuration**
   - Update the WebSocket service in Dashboard.tsx:
   ```javascript
   // Change from:
   export function Dashboard({ baseUrl = 'ws://localhost:8000' })
   
   // To:
   export function Dashboard({ baseUrl = window.location.origin.replace('http', 'ws') })
   ```

3. **Environment Variables**
   - Set correct environment variables for production:
   ```bash
   # For Netlify
   REACT_APP_API_URL=https://your-backend-api.render.com
   REACT_APP_WS_URL=wss://your-backend-api.render.com
   ```

## Nested Directory Structure Issues

### Symptoms
- Imports not resolving correctly
- Duplicate components
- Component not found errors

### Solutions

1. **Fix Nested src Directory**
   ```bash
   # Check structure
   find src/frontend -type f | sort
   
   # Move components to correct location
   mkdir -p src/frontend/src/components
   mv src/frontend/components/* src/frontend/src/components/
   ```

2. **Update Imports**
   - Ensure imports point to the correct locations in your components
   
3. **Simplify Structure**
   If needed, flatten the structure:
   ```bash
   # Move all from nested src to frontend root
   cp -r src/frontend/src/* src/frontend/
   ```

## Data Not Updating

### Symptoms
- UI shows no data
- Statistics not updating
- Uploads not showing

### Solutions

1. **Check WebSocket Connections**
   - Open browser developer tools
   - Check network tab for WebSocket connections
   - Verify messages are being received

2. **Inspect Backend Logic**
   - Add console logs to track data flow
   - Verify data is being sent correctly

3. **Test API Endpoints Directly**
   ```bash
   # Test document creation API
   curl -X POST "http://localhost:8000/api/documents" \
     -H "Content-Type: application/json" \
     -d '{"title": "Test Doc", "content": "Test content"}'
   ```

## Gunicorn/Uvicorn Issues

### Symptoms
- Worker timeouts
- Server crashes
- Performance problems

### Solutions

1. **Configure workers appropriately**
   ```bash
   # Start with optimal worker count (2x number of CPU cores + 1)
   gunicorn -w 5 -k uvicorn.workers.UvicornWorker src.backend.main:app
   ```

2. **Increase timeouts**
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker --timeout 120 src.backend.main:app
   ```

3. **Memory issues**
   ```bash
   # Add max-requests to recycle workers
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker --max-requests 1000 src.backend.main:app
   ```

## Log File Inspection

For in-depth troubleshooting, check the log files:

```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# System monitor logs
tail -f logs/system.log
```

If you encounter any issues not covered in this guide, please open an issue on the project repository.