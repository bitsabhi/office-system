import { WorkflowMessage } from '@/types/websocket';

interface WorkflowStreamProps {
  workflows: WorkflowMessage[];
  error?: string;
}

export function WorkflowStream({ workflows, error }: WorkflowStreamProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Workflow Stream</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {workflows.length > 0 ? (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div key={workflow.workflow_id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">Workflow: {workflow.workflow_id.substring(0, 8)}</h3>
                  <p className="text-sm text-gray-600">Document: {workflow.document_id.substring(0, 8)}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  workflow.status === 'completed' ? 'bg-green-100 text-green-800' :
                  workflow.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {workflow.status}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs text-gray-500">Started: {new Date(workflow.started_at).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Updated: {new Date(workflow.updated_at).toLocaleString()}</p>
              </div>

              {workflow.steps.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium">Steps:</p>
                  <ul className="mt-1 space-y-1">
                    {workflow.steps.map((step, index) => (
                      <li key={index} className="text-xs flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'error' ? 'bg-red-500' :
                          step.status === 'running' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`}></span>
                        {step.name} - {step.status}
                        {step.completed_at && ` (${new Date(step.completed_at).toLocaleTimeString()})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No active workflows</p>
      )}
    </div>
  );
}
