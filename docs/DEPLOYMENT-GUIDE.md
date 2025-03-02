# Office System Deployment Guide

This guide outlines the steps to deploy the Office System to GitHub and then to a production environment.

## GitHub Deployment

1. **Prepare the project**:
   ```bash
   # Make the deployment script executable
   chmod +x deploy.sh
   
   # Run the deployment script
   ./deploy.sh
   ```

2. This script will:
   - Create necessary directories
   - Set up virtual environment
   - Install dependencies
   - Initialize Git repository
   - Add GitHub remote
   - Offer to push to GitHub

## Production Deployment Options

### Option 1: Traditional Server Deployment

Follow the instructions in `Deploy.md`:

1. Prepare a Linux server (Ubuntu 20.04 LTS or newer)
2. Install system requirements:
   - Python 3.9+
   - Node.js 16+
   - Nginx
   - Supervisor

3. Deploy backend and configure Gunicorn service
4. Build the frontend
5. Configure Nginx as a reverse proxy
6. Set up SSL/TLS (optional but recommended)

The complete step-by-step guide is available in `Deploy.md`.

### Option 2: Netlify + Render.com Deployment

For cloud deployment using Netlify (frontend) and Render.com (backend):

1. Follow the instructions in `NetlifyDeployment.md`
2. Run the Netlify deployment script:
   ```bash
   # Make the script executable
   chmod +x NetlifyDeployment.md
   
   # Run the script
   ./NetlifyDeployment.md
   ```

3. The script will:
   - Prepare the frontend for deployment
   - Deploy to Netlify
   - Provide instructions for backend deployment to Render.com

## Post-Deployment Tasks

After successful deployment:

1. Verify the application is running correctly
2. Check all WebSocket connections
3. Monitor system logs
4. Test document upload and processing

## Troubleshooting

Refer to the troubleshooting section in `README.md` for common issues and their solutions.

For deployment-specific issues:
- Check server logs
- Verify service status
- Ensure proper network configuration for WebSocket connections

## Maintenance

Regular maintenance tasks:
- Update dependencies
- Monitor system logs
- Backup data
- Check for security updates