import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { extractUserIdFromAuthHeader, JWTError } from '../utils/jwt';

export interface UserSocket {
  socket: Socket;
  userId: string;
  connectedAt: Date;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: Date;
}

export class WebSocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, UserSocket> = new Map();
  private socketToUser: Map<string, string> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.use(this.authenticateSocket.bind(this));

    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });

      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });

      // Handle custom events
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date() });
      });
    });
  }

  private async authenticateSocket(socket: Socket, next: (err?: Error) => void): Promise<void> {
    try {
      const authHeader = socket.handshake.headers.authorization;
      const userId = extractUserIdFromAuthHeader(authHeader);

      // Store user information in socket
      (socket as any).userId = userId;

      // Check if user already has a connection and disconnect the old one
      const existingConnection = this.userSockets.get(userId);
      if (existingConnection) {
        console.log(`Disconnecting existing connection for user: ${userId}`);
        existingConnection.socket.disconnect(true);
        this.removeUserSocket(userId);
      }

      // Store the new connection
      const userSocket: UserSocket = {
        socket,
        userId,
        connectedAt: new Date()
      };

      this.userSockets.set(userId, userSocket);
      this.socketToUser.set(socket.id, userId);

      console.log(`User ${userId} authenticated and connected via socket ${socket.id}`);

      // Send welcome message
      socket.emit('authenticated', {
        userId,
        message: 'Successfully authenticated',
        timestamp: new Date()
      });

      next();
    } catch (error) {
      console.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  }

  private handleDisconnection(socket: Socket): void {
    const userId = this.socketToUser.get(socket.id);
    if (userId) {
      console.log(`User ${userId} disconnected (socket: ${socket.id})`);
      this.removeUserSocket(userId);
      this.socketToUser.delete(socket.id);
    } else {
      console.log(`Unknown socket disconnected: ${socket.id}`);
    }
  }

  private removeUserSocket(userId: string): void {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      this.socketToUser.delete(userSocket.socket.id);
      this.userSockets.delete(userId);
    }
  }

  /**
   * Send a message to a specific user
   * @param userId - Target user ID
   * @param message - Message to send
   * @returns true if message was sent, false if user is not connected
   */
  public sendMessageToUser(userId: string, message: WebSocketMessage): boolean {
    const userSocket = this.userSockets.get(userId);

    if (!userSocket) {
      console.log(`User ${userId} is not connected`);
      return false;
    }

    const messageWithTimestamp: WebSocketMessage = {
      ...message,
      timestamp: message.timestamp || new Date()
    };

    userSocket.socket.emit('message', messageWithTimestamp);
    console.log(`Message sent to user ${userId}:`, messageWithTimestamp);

    return true;
  }

  /**
   * Send a message to multiple users
   * @param userIds - Array of target user IDs
   * @param message - Message to send
   * @returns Array of user IDs that received the message
   */
  public sendMessageToUsers(userIds: string[], message: WebSocketMessage): string[] {
    const deliveredTo: string[] = [];

    userIds.forEach(userId => {
      if (this.sendMessageToUser(userId, message)) {
        deliveredTo.push(userId);
      }
    });

    return deliveredTo;
  }

  /**
   * Broadcast a message to all connected users
   * @param message - Message to broadcast
   * @returns Number of users that received the message
   */
  public broadcastMessage(message: WebSocketMessage): number {
    const messageWithTimestamp: WebSocketMessage = {
      ...message,
      timestamp: message.timestamp || new Date()
    };

    this.io.emit('message', messageWithTimestamp);
    console.log(`Message broadcasted to ${this.userSockets.size} users:`, messageWithTimestamp);

    return this.userSockets.size;
  }

  /**
   * Get all connected user IDs
   * @returns Array of connected user IDs
   */
  public getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Check if a user is connected
   * @param userId - User ID to check
   * @returns true if user is connected
   */
  public isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get connection info for a user
   * @param userId - User ID
   * @returns UserSocket info or null if not connected
   */
  public getUserConnection(userId: string): UserSocket | null {
    return this.userSockets.get(userId) || null;
  }

  /**
   * Get total number of connected users
   * @returns Number of connected users
   */
  public getConnectedUserCount(): number {
    return this.userSockets.size;
  }

  /**
   * Disconnect a specific user
   * @param userId - User ID to disconnect
   * @returns true if user was disconnected, false if not connected
   */
  public disconnectUser(userId: string): boolean {
    const userSocket = this.userSockets.get(userId);

    if (!userSocket) {
      return false;
    }

    userSocket.socket.disconnect(true);
    this.removeUserSocket(userId);

    return true;
  }

  /**
   * Send a notification-style message to a user
   * @param userId - Target user ID
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Additional data
   * @returns true if message was sent
   */
  public sendNotification(userId: string, title: string, body: string, data?: any): boolean {
    return this.sendMessageToUser(userId, {
      type: 'notification',
      data: {
        title,
        body,
        ...data
      }
    });
  }

  /**
   * Get the Socket.IO server instance
   * @returns Socket.IO server instance
   */
  public getSocketIOServer(): SocketIOServer {
    return this.io;
  }
}

// Singleton instance
let webSocketServiceInstance: WebSocketService | null = null;

/**
 * Initialize the WebSocket service
 * @param httpServer - HTTP server instance
 * @returns WebSocket service instance
 */
export function initializeWebSocketService(httpServer: HTTPServer): WebSocketService {
  if (webSocketServiceInstance) {
    throw new Error('WebSocket service is already initialized');
  }

  webSocketServiceInstance = new WebSocketService(httpServer);
  return webSocketServiceInstance;
}

/**
 * Get the WebSocket service instance
 * @returns WebSocket service instance
 * @throws Error if service is not initialized
 */
export function getWebSocketService(): WebSocketService {
  if (!webSocketServiceInstance) {
    throw new Error('WebSocket service is not initialized. Call initializeWebSocketService first.');
  }

  return webSocketServiceInstance;
}
