export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: Date;
}

export interface NotificationMessage extends WebSocketMessage {
  type: 'notification';
  data: {
    title: string;
    body: string;
    [key: string]: any;
  };
}

export interface SystemMessage extends WebSocketMessage {
  type: 'system';
  data: {
    message: string;
    level: 'info' | 'warning' | 'error';
    [key: string]: any;
  };
}

export interface CustomMessage extends WebSocketMessage {
  type: string;
  data: {
    [key: string]: any;
  };
}

export interface UserConnection {
  userId: string;
  socketId: string;
  connectedAt: Date;
  lastActivity: Date;
}

export interface ConnectionStats {
  totalConnections: number;
  connectedUsers: string[];
  connectionsPerUser: Record<string, number>;
}

export interface MessageDeliveryResult {
  success: boolean;
  deliveredTo: string[];
  failedDeliveries: string[];
  totalAttempted: number;
  totalDelivered: number;
}

export interface WebSocketConfig {
  cors?: {
    origin: string | string[];
    methods: string[];
  };
  transports?: string[];
  pingTimeout?: number;
  pingInterval?: number;
}

export interface AuthenticatedSocket {
  id: string;
  userId: string;
  authenticated: boolean;
  connectedAt: Date;
}

export type MessageType =
  | 'notification'
  | 'system'
  | 'chat'
  | 'update'
  | 'alert'
  | 'custom';

export type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'reconnecting';
