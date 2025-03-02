# Office System Deployment Guide

This document outlines how to deploy the Office System to a production server.

## System Requirements

- Linux server (Ubuntu 20.04 LTS or newer recommended)
- Python 3.9+ with pip and venv
- Node.js 16+ and npm
- Nginx for reverse proxy
- Supervisor for process management

## Deployment Steps

### 1. Prepare the Server

```bash
# Update package lists
sudo apt update

# Install required system packages
sudo apt install -y python3-venv python3-pip nodejs npm nginx supervisor

# Create deployment directory
mkdir -p /var/www/office-system
```

### 2. Deploy Backend

```bash
# Clone or copy the application to the server
cd /var/www/office-system

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn gunicorn websockets python-multipart psutil pandas

# Copy your application files to the server
# (using SCP, SFTP, or Git)

# Create required directories
mkdir -p {uploads,logs,data/analytics}
```

### 3. Configure Gunicorn Service

Create a supervisor configuration file:

```bash
sudo nano /etc/supervisor/conf.d/office-system.conf
```

Add the following content:

```ini
[program:office-system]
command=/var/www/office-system/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker src.backend.main:app -b 127.0.0.1:8000
directory=/var/www/office-system
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
stdout_logfile=/var/www/office-system/logs/gunicorn.log
stderr_logfile=/var/www/office-system/logs/gunicorn-error.log
```

Update permissions and reload supervisor:

```bash
sudo chown -R www-data:www-data /var/www/office-system
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start office-system
```

### 4. Build the Frontend

```bash
# Change to frontend directory
cd /var/www/office-system/src/frontend

# Install dependencies
npm install

# Fix TypeScript errors for production
npm install --save-dev @types/node

# Build the frontend
npm run build
```

### 5. Configure Nginx

Create a new Nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/office-system
```

Add the following content:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your actual domain

    # Serve frontend static files
    location / {
        root /var/www/office-system/src/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy configuration
    location /ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Serve uploaded files
    location /uploads {
        alias /var/www/office-system/uploads;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/office-system /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### 6. SSL/TLS (Optional but Recommended)

Install Certbot for Let's Encrypt SSL:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Monitoring and Maintenance

### Check Service Status

```bash
sudo supervisorctl status office-system
```

### View Logs

```bash
# Backend logs
tail -f /var/www/office-system/logs/gunicorn.log
tail -f /var/www/office-system/logs/gunicorn-error.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart backend
sudo supervisorctl restart office-system

# Restart Nginx
sudo systemctl restart nginx
```

## Deployment Script

For automated deployment, you can create a shell script:

```bash
#!/bin/bash

# Stop running services
sudo supervisorctl stop office-system

# Pull latest code (if using git)
# git pull

# Update virtual environment
cd /var/www/office-system
source venv/bin/activate
pip install -r requirements.txt

# Build frontend
cd src/frontend
npm install
npm run build

# Fix permissions
cd /var/www/office-system
sudo chown -R www-data:www-data .

# Restart services
sudo supervisorctl start office-system
sudo systemctl restart nginx

echo "Deployment completed successfully!"
```

Make the script executable: `chmod +x deploy.sh`

## Troubleshooting

### WebSocket Connection Issues
- Check Nginx proxy settings
- Verify firewall allows WebSocket connections
- Inspect browser console for connection errors

### Backend Service Not Starting
- Check supervisor logs: `sudo supervisorctl tail office-system`
- Verify dependencies are installed correctly
- Check file permissions

### Frontend Not Loading
- Verify the build process completed successfully
- Check Nginx configurations and logs
- Confirm static file paths are correct