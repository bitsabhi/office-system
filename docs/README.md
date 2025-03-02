# Office System

A document processing and workflow management system with real-time analytics and WebSocket integration for live updates.

## Features

- **Document Management**: Upload, process, and track documents
- **Real-time Analytics**: Monitor system metrics and document processing
- **Workflow Engine**: Automated document processing pipeline
- **WebSocket Integration**: Live updates for system status and processing
- **Modern UI**: React-based frontend with responsive design

## System Architecture

```
office_system/
├── src/                      # Source code
│   ├── backend/              # Backend API and processing
│   │   ├── analytics/        # Analytics engine
│   │   ├── monitoring/       # System monitoring
│   │   ├── workflow/         # Document workflow
│   │   └── main.py           # FastAPI application
│   └── frontend/             # Frontend React application
│       ├── src/              # React source
│       │   ├── components/   # UI components
│       │   ├── services/     # API services
│       │   └── types/        # TypeScript types
│       └── public/           # Static assets
├── config/                   # Configuration files
├── data/                     # Processed data
├── logs/                     # System logs
└── uploads/                  # Uploaded files
```

## Technology Stack

- **Backend**:
  - Python 3.9+
  - FastAPI
  - Uvicorn/Gunicorn
  - WebSockets
  - Pandas

- **Frontend**:
  - React
  - TypeScript
  - Vite
  - Tailwind CSS

## Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- npm 8 or higher

## Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/yourusername/office-system.git
cd office-system
```

### Setup Python Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Install Frontend Dependencies

```bash
cd src/frontend
npm install
```

## Running the Application

### Quick Start

Simply run the provided script to start both backend and frontend:

```bash
./run-office-system.sh
```

You can stop both services with:

```bash
./stop-office-system.sh
```

### Start with the Run Script

The easiest way to run the application is using the provided script:

```bash
./run-office-system.sh
```

This will:
- Check and install required dependencies
- Start the backend server
- Start the frontend development server
- Create a stop script for shutting down

### Manual Startup

#### Backend

```bash
cd office-system
source venv/bin/activate
PYTHONPATH=$PYTHONPATH:src uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd office-system/src/frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Usage

### Document Processing

1. Navigate to the application in your browser
2. Use the Document Stream section to create or upload a document
3. The system will automatically process the document
4. Track processing status in the Workflow Stream section

### Analytics

The Analytics Stream section provides:
- Document count
- Upload count
- User action metrics
- Activity timeline

### Real-time Updates

All sections update in real-time as documents are processed and system metrics change.

## Production Deployment

See [DEPLOYMENT.md](deployment-guide.md) for detailed instructions on deploying to a production server.

## Development

### Project Structure

- **Backend Modules**:
  - `analytics`: Data analysis and reporting
  - `monitoring`: System health monitoring
  - `workflow`: Document processing pipeline

- **Frontend Components**:
  - `DocumentStream`: Document creation and upload
  - `AnalyticsStream`: System metrics display
  - `WorkflowStream`: Processing status tracking

### WebSocket Endpoints

- `/ws/documents`: Document updates
- `/ws/analytics`: Analytics data updates
- `/ws/workflows`: Workflow status updates

### API Endpoints

- `GET /api/system-status`: System health metrics
- `POST /api/upload`: Document upload
- `POST /api/documents`: Create document
- `GET /api/documents`: List documents
- `GET /api/documents/{id}`: Get document details

## Stopping the Application

To stop all services:

```bash
./stop-office-system.sh
```

## Troubleshooting

### Connection Lost Messages

If you see "Connection lost. Attempting to reconnect..." messages:
- Ensure the backend server is running
- Check browser console for detailed errors
- Verify WebSocket endpoints are configured correctly

### Logs

Check the log files for detailed information:
- `logs/backend.log`: Backend server logs
- `logs/frontend.log`: Frontend development server logs

## License

[MIT License](LICENSE)

## Contributors

- Abhishek