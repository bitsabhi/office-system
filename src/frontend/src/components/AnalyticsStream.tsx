import { AnalyticsMessage } from '../types/websocket';

interface AnalyticsStreamProps {
  data: AnalyticsMessage[];
  error?: string;
}

export function AnalyticsStream({ data, error }: AnalyticsStreamProps) {
  const latestData = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Analytics Stream</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {latestData ? (
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-500">Documents</p>
              <p className="text-2xl font-bold">{latestData.document_count}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-500">Uploads</p>
              <p className="text-2xl font-bold">{latestData.upload_count}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-500">User Actions</p>
              <p className="text-2xl font-bold">{latestData.user_actions}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-gray-500">Last Update</p>
              <p className="text-sm font-medium">
                {new Date(latestData.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {data.length > 1 && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Activity Timeline</h3>
              <div className="space-y-2">
                {data.slice().reverse().map((item, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    {new Date(item.timestamp).toLocaleString()} -
                    Documents: {item.document_count},
                    Actions: {item.user_actions}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Waiting for analytics data...</p>
      )}
    </div>
  );
}
