# Office System

A real-time document management platform with WebSocket integration for live updates.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

- **Document Management**: Create and track text documents
- **Real-time Analytics**: Monitor system metrics and document processing
- **Workflow Engine**: Automated document processing pipeline
- **WebSocket Integration**: Live updates for system status and processing
- **Modern UI**: React-based frontend with responsive design

## Technologies Used

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- WebSocket for real-time connections

### Backend
- FastAPI (Python)
- Uvicorn as ASGI server
- WebSockets for real-time communication
- SQLAlchemy for database operations

## System Architecture

The Office System consists of three main components:

1. **Document Stream**: Creates and manages text documents
2. **Analytics Stream**: Monitors system metrics and usage statistics
3. **Workflow Stream**: Tracks document processing status

All three components communicate in real-time through WebSocket connections:
- `/ws/documents` - Document creation and updates
- `/ws/analytics` - System metrics and analytics
- `/ws/workflows` - Document processing workflow status

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bitsabhi/office-system.git
cd office-system
```

2. Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd src/frontend
npm install
```

### Running Locally

1. Start the backend server:
```bash
cd src/backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd src/frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Deployment

### Backend (Render.com)
The backend is deployed on Render.com as a Web Service.

### Frontend (Netlify)
The frontend is deployed on Netlify with proper redirects for API and WebSocket connections.

For detailed deployment instructions, see [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md).

## Project Structure

```
office-system/
├── requirements.txt        # Python dependencies
├── README.md               # Project documentation
├── DEPLOYMENT-GUIDE.md     # Deployment instructions
├── src/
│   ├── backend/            # FastAPI backend
│   │   ├── main.py         # Main application entry point
│   │   └── ...             # Other backend modules
│   ├── frontend/           # React frontend
│       ├── src/            # Frontend source code
│       │   ├── components/ # React components
│       │   ├── services/   # Service modules
│       │   └── types/      # TypeScript type definitions
│       ├── index.html      # HTML entry point
│       ├── vite.config.ts  # Vite configuration
│       └── package.json    # Frontend dependencies
├── data/                   # Data storage
└── logs/                   # Application logs
```

## WebSocket Integration

The system uses WebSockets for real-time communication between frontend and backend:

```typescript
// Example WebSocket connection
const ws = new WebSocketService(baseUrl);
ws.connect({
  endpoint: '/ws/documents',
  onMessage: handleMessage,
  onError: handleError('/ws/documents'),
  onConnect: handleConnect('/ws/documents')
});
```

The WebSocket service handles automatic reconnection and provides real-time updates across all components.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
