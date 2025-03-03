// src/types/websocket.ts
export interface DocumentMessage {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string; // ISO date string
  updated_at?: string; // ISO date string, optional
  timestamp?: string; // Add this as an alias for created_at for backward compatibility
}

export interface AnalyticsMessage {
  timestamp: string;
  document_count: number;
  upload_count: number; // Added for AnalyticsStream.tsx
  user_actions: number; // Added for AnalyticsStream.tsx
  active_users: number;
  processing_time: number;
  system_load: number;
}

export interface WorkflowStep {
  name: string;
  status: string;
  completed: boolean;
}

export interface WorkflowMessage {
  workflow_id: string;
  document_id: string;
  status: string;
  step: string;
  steps: WorkflowStep[]; // Added for WorkflowStream.tsx
  progress: number;
  timestamp: string;
  started_at: string; // Added for WorkflowStream.tsx
  updated_at: string; // Added for WorkflowStream.tsx
}