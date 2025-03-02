import { useState } from 'react';
import { DocumentMessage } from '@/types/websocket';

interface DocumentStreamProps {
  lastMessage?: DocumentMessage;
  error?: string;
  onDocumentUpdate: (doc: DocumentMessage) => void;
}

export function DocumentStream({ lastMessage, error, onDocumentUpdate }: DocumentStreamProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          type: 'text'
        }),
      });

      if (response.ok) {
        const newDoc = await response.json();
        onDocumentUpdate(newDoc);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      console.error('Error creating document:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Document Stream</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!title}
        >
          Create Document
        </button>
      </form>

      {lastMessage && (
        <div className="border-t pt-4">
          <h3 className="font-bold">Latest Document</h3>
          <div className="mt-2 p-3 bg-gray-50 rounded">
            <p><span className="font-semibold">Title:</span> {lastMessage.title}</p>
            <p><span className="font-semibold">Status:</span> {lastMessage.status}</p>
            <p><span className="font-semibold">Created:</span> {new Date(lastMessage.created_at).toLocaleString()}</p>
            {lastMessage.content && (
              <p className="mt-2"><span className="font-semibold">Preview:</span> {lastMessage.content.substring(0, 100)}...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
