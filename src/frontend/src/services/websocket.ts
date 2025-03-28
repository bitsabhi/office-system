// src/services/websocket.ts
interface WebSocketOptions {
  endpoint: string;
  onMessage: (data: any) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketService {
  private baseUrl: string;
  private connections: Map<string, WebSocket> = new Map();
  private reconnectTimers: Map<string, number> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  connect(options: WebSocketOptions): () => void {
    const {
      endpoint,
      onMessage,
      onError,
      onConnect,
      reconnectDelay = 3000,
      maxReconnectAttempts = 5
    } = options;

    // Initialize reconnect attempts counter
    this.reconnectAttempts.set(endpoint, 0);

    // Create and establish connection
    const setupConnection = () => {
      // Clear any existing connection
      this.disconnect(endpoint);

      // Construct full WebSocket URL
      let url = '';

      // Handle different URL formats based on environment
      if (this.baseUrl) {
        // If baseUrl is provided, use it directly
        url = `${this.baseUrl}${endpoint}`;
      } else {
        // For relative URLs in development, use the current host with ws/wss protocol
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        url = `${protocol}//${host}${endpoint}`;
      }

      console.log(`Connecting to WebSocket: ${url}`);

      try {
        const ws = new WebSocket(url);
        this.connections.set(endpoint, ws);

        // Set up event handlers
        ws.onopen = () => {
          console.log(`WebSocket connection established to ${endpoint}`);
          // Reset reconnect attempts on successful connection
          this.reconnectAttempts.set(endpoint, 0);
          // Notify of successful connection
          if (onConnect) onConnect();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error on ${endpoint}:`, error);
          if (onError) onError(error);
        };

        ws.onclose = (event) => {
          console.log(`WebSocket connection closed for ${endpoint}. Code: ${event.code}`);

          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000) {
            const attempts = this.reconnectAttempts.get(endpoint) || 0;

            if (attempts < maxReconnectAttempts) {
              console.log(`Attempting to reconnect to ${endpoint} (${attempts + 1}/${maxReconnectAttempts})...`);

              // Increase backoff time with each attempt
              const delay = reconnectDelay * Math.pow(1.5, attempts);

              // Schedule reconnection attempt
              const timerId = window.setTimeout(() => {
                this.reconnectAttempts.set(endpoint, attempts + 1);
                setupConnection();
              }, delay);

              this.reconnectTimers.set(endpoint, timerId);
            } else {
              console.error(`Maximum reconnection attempts (${maxReconnectAttempts}) reached for ${endpoint}`);
            }
          }
        };
      } catch (error) {
        console.error(`Failed to create WebSocket connection to ${url}:`, error);
        if (onError) onError(new Event('error'));

        // Try to reconnect after delay
        const attempts = this.reconnectAttempts.get(endpoint) || 0;
        if (attempts < maxReconnectAttempts) {
          const timerId = window.setTimeout(() => {
            this.reconnectAttempts.set(endpoint, attempts + 1);
            setupConnection();
          }, reconnectDelay);
          this.reconnectTimers.set(endpoint, timerId);
        }
      }
    };

    // Initial connection
    setupConnection();

    // Return disconnect function
    return () => this.disconnect(endpoint);
  }

  disconnect(endpoint: string): void {
    // Clear any reconnect timer
    const timerId = this.reconnectTimers.get(endpoint);
    if (timerId) {
      clearTimeout(timerId);
      this.reconnectTimers.delete(endpoint);
    }

    // Close existing connection
    const connection = this.connections.get(endpoint);
    if (connection) {
      if (connection.readyState === WebSocket.OPEN ||
          connection.readyState === WebSocket.CONNECTING) {
        try {
          connection.close(1000, 'Normal closure');
        } catch (e) {
          console.error(`Error closing WebSocket:`, e);
        }
      }
      this.connections.delete(endpoint);
    }
  }

  // Send data to a specific endpoint
  send(endpoint: string, data: any): boolean {
    const connection = this.connections.get(endpoint);

    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(data));
      return true;
    }

    console.error(`Cannot send to ${endpoint}: connection not open`);
    return false;
  }
}
