// src/components/Dashboard.tsx
import { useEffect, useState, useCallback } from 'react';
import { DocumentStream } from './DocumentStream';
import { AnalyticsStream } from './AnalyticsStream';
import { WorkflowStream } from './WorkflowStream';
import { DocumentMessage, AnalyticsMessage, WorkflowMessage } from '../types/websocket';

// Import WebSocket service
import { WebSocketService } from '../services/websocket';

interface DashboardProps {
  baseUrl?: string;
}

export function Dashboard({
                            baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                                ? 'ws://localhost:8000' // This is the correct URL for local development
                                : 'wss://office-system.onrender.com'
}: DashboardProps) {
  const [documentMessage, setDocumentMessage] = useState<DocumentMessage>();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsMessage[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowMessage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState<Record<string, boolean>>({
    documents: false,
    analytics: false,
    workflows: false
  });

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((message: any) => {
    console.log("Message received:", message);
    if (message.type === 'document') {
      setDocumentMessage(message.payload);
    } else if (message.type === 'analytics') {
      setAnalyticsData(prev => {
        const newData = [...prev, message.payload];
        return newData.slice(-20); // Keep last 20 data points
      });
    } else if (message.type === 'workflow') {
      setWorkflows(prev => {
        const filtered = prev.filter(w => w.workflow_id !== message.payload.workflow_id);
        return [...filtered, message.payload].slice(-5); // Keep last 5 workflows
      });
    }
  }, []);

  // Handle WebSocket errors
  const handleError = useCallback((endpoint: string) => (error: Event) => {
    console.error(`WebSocket error on ${endpoint}:`, error);
    setErrors(prev => ({
      ...prev,
      [endpoint]: 'Connection lost. Attempting to reconnect...'
    }));
    setConnected(prev => ({
      ...prev,
      [endpoint.split('/').pop() || '']: false
    }));
  }, []);

  // Handle successful connection
  const handleConnect = useCallback((endpoint: string) => () => {
    console.log(`Connected to ${endpoint}`);
    setErrors(prev => ({
      ...prev,
      [endpoint]: ''
    }));
    setConnected(prev => ({
      ...prev,
      [endpoint.split('/').pop() || '']: true
    }));
  }, []);

  // Set up WebSocket connections
  useEffect(() => {
    console.log("Setting up WebSocket connections with baseUrl:", baseUrl);
    const ws = new WebSocketService(baseUrl);
    
    // Connect to all streams
    const documentDisconnect = ws.connect({
      endpoint: '/ws/documents',
      onMessage: handleMessage,
      onError: handleError('/ws/documents'),
      onConnect: handleConnect('/ws/documents')
    });
    
    const analyticsDisconnect = ws.connect({
      endpoint: '/ws/analytics',
      onMessage: handleMessage,
      onError: handleError('/ws/analytics'),
      onConnect: handleConnect('/ws/analytics')
    });
    
    const workflowDisconnect = ws.connect({
      endpoint: '/ws/workflows',
      onMessage: handleMessage,
      onError: handleError('/ws/workflows'),
      onConnect: handleConnect('/ws/workflows')
    });

    // Clean up WebSocket connections on unmount
    return () => {
      documentDisconnect();
      analyticsDisconnect();
      workflowDisconnect();
    };
  }, [baseUrl, handleMessage, handleError, handleConnect]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <header className="bg-white rounded-lg shadow p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Office System Dashboard</h1>
        <p className="text-gray-600">Real-time document management and analytics</p>
        <div className="flex space-x-4 mt-2">
          <ConnectionStatus connected={connected.documents} name="Documents" />
          <ConnectionStatus connected={connected.analytics} name="Analytics" />
          <ConnectionStatus connected={connected.workflows} name="Workflows" />
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentStream
          onDocumentUpdate={(doc) => setDocumentMessage(doc)}
          lastMessage={documentMessage}
          error={errors['/ws/documents']}
        />
        <AnalyticsStream
          data={analyticsData}
          error={errors['/ws/analytics']}
        />
      </div>
      
      <WorkflowStream
        workflows={workflows}
        error={errors['/ws/workflows']}
      />
    </div>
  );
}

// Connection status indicator component
function ConnectionStatus({ connected, name }: { connected: boolean; name: string }) {
  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-sm">{name}: {connected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}
