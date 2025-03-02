export type MessageHandler = (message: any) => void;
export type ErrorHandler = (event: Event) => void;

interface ConnectionOptions {
  endpoint: string;
  onMessage: MessageHandler;
  onError?: ErrorHandler;
}

export class WebSocketService {
  private baseUrl: string;
  private connections: Map<string, WebSocket> = new Map();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public connect({ endpoint, onMessage, onError }: ConnectionOptions): () => void {
    const url = `${this.baseUrl}${endpoint}`;

    // Close existing connection if any
    if (this.connections.has(endpoint)) {
      this.connections.get(endpoint)?.close();
    }

    // Create new WebSocket connection
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (event) => {
      console.error(`WebSocket error on ${endpoint}:`, event);
      if (onError) {
        onError(event);
      }
    };

    ws.onclose = () => {
      console.log(`WebSocket connection closed: ${endpoint}`);
      this.connections.delete(endpoint);

      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log(`Attempting to reconnect to ${endpoint}...`);
        this.connect({ endpoint, onMessage, onError });
      }, 3000);
    };

    // Store the connection
    this.connections.set(endpoint, ws);

    // Return disconnect function
    return () => {
      if (this.connections.has(endpoint)) {
        this.connections.get(endpoint)?.close();
        this.connections.delete(endpoint);
      }
    };
  }
}
