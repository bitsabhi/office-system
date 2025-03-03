# Office System Deployment Guide

This guide provides instructions for deploying the Office System application, which consists of a FastAPI backend and a React frontend.

## Overview

The Office System is a document management platform with real-time WebSocket connections that allows users to:
- Create and manage text documents
- Monitor system analytics in real-time
- Track document workflow status
- Receive live updates across all components

## Backend Deployment (Render.com)

1. **Prepare your backend**:
   - Ensure your `requirements.txt` file is in the project root and contains all necessary dependencies:
     ```
     fastapi==0.115.11
     uvicorn==0.34.0
     gunicorn==21.2.0
     websockets==12.0
     python-multipart==0.0.20
     psutil==7.0.0
     pandas==2.1.1
     sqlalchemy==2.0.38
     starlette==0.46.0
     typing_extensions==4.12.2
     ```

2. **Create a Render.com Web Service**:
   - Sign in to Render and create a new Web Service
   - Connect your GitHub repository
   - Use the following settings:
     - **Name**: office-system-backend
     - **Environment**: Python
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `cd src/backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Deploy the backend**:
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Your backend will be available at `https://office-system.onrender.com/` (or similar URL)

## Frontend Deployment (Netlify)

1. **Fix duplicate files**:
   If you have duplicate files at the root level and in the src directory, clean them up:
   ```bash
   # From the frontend directory
   rm App.css App.tsx index.css main.tsx
   ```

2. **Update your WebSocket connections**:
   - Replace your existing Dashboard.tsx with the improved version
   - Update websocket.ts with the enhanced WebSocket service
   - Update DocumentStream.tsx with the improved version

3. **Update index.html**:
   Make sure your index.html references the correct main.tsx file:
   ```html
   <script type="module" src="/src/main.tsx"></script>
   ```

4. **Create the proper netlify.toml**:
   Create or update the netlify.toml file in your frontend directory with the provided configuration.

5. **Build the frontend**:
   ```bash
   # From the frontend directory
   npm run build
   ```

6. **Deploy to Netlify**:
   ```bash
   # From the frontend directory
   netlify deploy --prod --dir=dist
   ```

## Troubleshooting

### WebSocket Connection Issues

If you experience WebSocket connection issues:

1. **Check your netlify.toml configuration**:
   - Make sure the WebSocket redirect is properly configured
   - The path format should be `/ws/*` (with the asterisk)

2. **Verify backend WebSocket endpoints**:
   - Ensure your backend has endpoints at:
     - `/ws/documents`
     - `/ws/analytics`
     - `/ws/workflows`

3. **Check browser console**:
   - Open your browser's developer tools
   - Look for WebSocket connection errors
   - Make sure the connection URLs are correct

4. **Test WebSocket Locally**:
   - Run your backend locally
   - Use a tool like `wscat` to test WebSocket connections
   ```bash
   wscat -c ws://localhost:8000/ws/documents
   ```

### Build Errors

If you encounter build errors:

1. **Check for path issues**:
   - Make sure import paths are correct
   - Check that index.html is referencing the correct main.tsx path

2. **Clean and rebuild**:
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   ```

## Future Improvements

Consider these enhancements to further improve your Office System:

1. **UI Improvements**:
   - Add a more professional color scheme
   - Improve typography and spacing
   - Add animations for data updates

2. **Feature Enhancements**:
   - Implement file upload capabilities
   - Add user authentication
   - Create a more detailed analytics dashboard
   - Add document search functionality

3. **Performance Optimizations**:
   - Implement pagination for large document collections
   - Add caching for frequently accessed data
   - Optimize WebSocket message sizes

## Maintenance

To maintain your deployed application:

1. **Monitor backend logs** on Render.com
2. **Check deployment status** on Netlify
3. **Set up alerts** for any service disruptions
4. **Regularly update dependencies** to maintain security

---

For any additional assistance, refer to the project's README.md or contact the development team.
