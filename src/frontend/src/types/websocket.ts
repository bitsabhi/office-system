export interface DocumentMessage {
  id: string;
  title: string;
  content?: string;
  status: string;
  created_at: string;
  updated_at: string;
  type: string;
}

export interface AnalyticsMessage {
  timestamp: string;
  document_count: number;
  upload_count: number;
  user_actions: number;
}

export interface WorkflowMessage {
  workflow_id: string;
  document_id: string;
  status: string;
  started_at: string;
  updated_at: string;
  steps: Array<{
    name: string;
    status: string;
    completed_at?: string;
  }>;
}

export interface WebSocketMessage {
  type: 'document' | 'analytics' | 'workflow';
  payload: any;
}
