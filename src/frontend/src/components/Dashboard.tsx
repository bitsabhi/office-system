import {useEffect, useState, useCallback} from 'react';
import {WebSocketService} from '../services/websocket';
import {DocumentStream} from './DocumentStream';
import {AnalyticsStream} from './AnalyticsStream';
import {WorkflowStream} from './WorkflowStream';
import {DocumentMessage, AnalyticsMessage, WorkflowMessage} from '../types/websocket';

interface DashboardProps {
    baseUrl?: string;
}

export function Dashboard({
                              baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '' // Empty for relative path in development
  : 'wss://office-system.onrender.com'
                          }: DashboardProps) {
    const [documentMessage, setDocumentMessage] = useState<DocumentMessage>();
    const [analyticsData, setAnalyticsData] = useState<AnalyticsMessage[]>([]);
    const [workflows, setWorkflows] = useState<WorkflowMessage[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

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

    const handleError = useCallback((endpoint: string) => (_: Event) => {
        setErrors(prev => ({
            ...prev,
            [endpoint]: 'Connection lost. Attempting to reconnect...'
        }));
    }, []);

    useEffect(() => {
        const ws = new WebSocketService(baseUrl);

        // Connect to all streams
        const documentDisconnect = ws.connect({
            endpoint: '/ws/documents',
            onMessage: handleMessage,
            onError: handleError('/ws/documents')
        });

        const analyticsDisconnect = ws.connect({
            endpoint: '/ws/analytics',
            onMessage: handleMessage,
            onError: handleError('/ws/analytics')
        });

        const workflowDisconnect = ws.connect({
            endpoint: '/ws/workflows',
            onMessage: handleMessage,
            onError: handleError('/ws/workflows')
        });

        return () => {
            documentDisconnect();
            analyticsDisconnect();
            workflowDisconnect();
        };
    }, [baseUrl, handleMessage, handleError]);

    return (
        <div className="p-6 space-y-6">
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
