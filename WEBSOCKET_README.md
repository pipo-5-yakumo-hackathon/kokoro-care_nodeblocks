# WebSocket Functionality Documentation

## Overview

This project includes WebSocket functionality that allows real-time bidirectional communication between the server and clients. The WebSocket service manages user connections based on JWT authentication and provides APIs for sending messages to specific users or broadcasting to all connected users.

## Features

- **JWT Authentication**: Users are authenticated using JWT tokens from the Authorization header
- **User-Based Socket Mapping**: Sockets are mapped by user ID (extracted from JWT `sub` field)
- **Message Targeting**: Send messages to specific users by their user ID
- **Broadcasting**: Send messages to all connected users
- **Connection Management**: Track and manage user connections
- **HTTP API Integration**: REST endpoints for sending WebSocket messages

## Architecture

### Core Components

1. **WebSocket Service** (`services/websocket.ts`)
   - Manages Socket.IO server instance
   - Handles user authentication and connection mapping
   - Provides methods for sending messages and managing connections

2. **JWT Utilities** (`utils/jwt.ts`)
   - Extracts user ID from JWT tokens
   - Handles token validation and parsing

3. **WebSocket Handlers** (`handlers/websocket.ts`)
   - HTTP endpoint handlers for WebSocket operations
   - API endpoints for sending messages and managing connections

4. **WebSocket Features** (`features/websocket.ts`)
   - Express route definitions following the project's pattern
   - Groups related endpoints into features

## Installation

The required dependencies are already installed:
- `socket.io` - WebSocket server implementation
- `jsonwebtoken` - JWT token handling
- `@types/jsonwebtoken` - TypeScript definitions

## Usage

### WebSocket Connection Endpoint

Clients can connect to the WebSocket server at:
```
ws://localhost:8090
```

### Authentication

Clients must provide a JWT token in the Authorization header when connecting:

```javascript
const socket = io('http://localhost:8090', {
  extraHeaders: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});
```

The JWT token must contain a `sub` field with the user ID.

### Client-Side Events

#### Connection Events
- `connect` - Fired when connected to the server
- `authenticated` - Fired when authentication is successful
- `disconnect` - Fired when disconnected from the server

#### Message Events
- `message` - Receives messages sent to the user
- `pong` - Response to ping messages

#### Example Client Code

```javascript
const socket = io('http://localhost:8090', {
  extraHeaders: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
});

socket.on('message', (data) => {
  console.log('Received message:', data);
});

// Send ping
socket.emit('ping');

socket.on('pong', (data) => {
  console.log('Received pong:', data);
});
```

## HTTP API Endpoints

### Message Endpoints

#### Send Message to Specific User
```http
POST /websocket/message/user
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "userId": "user123",
  "type": "chat",
  "data": {
    "message": "Hello!",
    "sender": "system"
  }
}
```

#### Send Message to Multiple Users
```http
POST /websocket/message/users
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "userIds": ["user123", "user456"],
  "type": "announcement",
  "data": {
    "title": "System Update",
    "message": "System will be updated tonight"
  }
}
```

#### Broadcast Message to All Users
```http
POST /websocket/message/broadcast
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "type": "system",
  "data": {
    "message": "Welcome to our platform!",
    "level": "info"
  }
}
```

#### Send Notification
```http
POST /websocket/notification
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "userId": "user123",
  "title": "New Message",
  "body": "You have received a new message",
  "data": {
    "category": "message",
    "priority": "normal"
  }
}
```

### Connection Management Endpoints

#### Get Connected Users
```http
GET /websocket/users/connected
Authorization: Bearer JWT_TOKEN
```

#### Check User Connection Status
```http
GET /websocket/users/{userId}/status
Authorization: Bearer JWT_TOKEN
```

#### Get My Connection Status
```http
GET /websocket/me/status
Authorization: Bearer JWT_TOKEN
```

#### Disconnect User
```http
DELETE /websocket/users/{userId}/disconnect
Authorization: Bearer JWT_TOKEN
```

## Message Types

The system supports various message types:

- `notification` - User notifications
- `chat` - Chat messages
- `system` - System announcements
- `update` - Data updates
- `alert` - Important alerts
- `custom` - Custom message types

## Message Structure

All WebSocket messages follow this structure:

```typescript
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: Date;
}
```

### Notification Messages
```typescript
{
  type: 'notification',
  data: {
    title: string,
    body: string,
    [key: string]: any
  },
  timestamp: Date
}
```

### System Messages
```typescript
{
  type: 'system',
  data: {
    message: string,
    level: 'info' | 'warning' | 'error',
    [key: string]: any
  },
  timestamp: Date
}
```

## Testing

### Using the HTML Test Client

1. Open `websocket-client.html` in your browser
2. Enter your server URL and JWT token
3. Click "Connect" to establish WebSocket connection
4. Use the various buttons to test different functionalities

### Using HTTP Test File

Use the `testing-websocket.http` file with your HTTP client (like REST Client in VS Code) to test the API endpoints.

### Sample JWT Tokens

For testing purposes, you can use these sample JWT tokens:

**User 123:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**User 456:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyNDU2IiwibmFtZSI6IkphbmUgU21pdGgiLCJpYXQiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ
```

**User 789:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyNzg5IiwibmFtZSI6IkJvYiBKb2huc29uIiwiaWF0IjoxNTE2MjM5MDIyfQ.onuUeVV4KP5zV8TLMVhQUedo9P9zGUz2hKhP0YoWJIQ
```

## Configuration

### CORS Configuration

The WebSocket server is configured with CORS settings to allow connections from any origin. In production, you should restrict this:

```typescript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "https://your-frontend-domain.com",
    methods: ["GET", "POST"]
  }
});
```

### Connection Limits

You can configure connection limits and other Socket.IO options in the WebSocket service constructor.

## Error Handling

The system includes comprehensive error handling:

- **JWT Authentication Errors**: Invalid or missing tokens are handled gracefully
- **Connection Errors**: Clients receive appropriate error messages
- **Message Delivery Errors**: Failed message deliveries are logged and reported

## Security Considerations

1. **JWT Validation**: In production, implement proper JWT signature verification
2. **Rate Limiting**: Consider implementing rate limiting for message sending
3. **CORS Configuration**: Restrict CORS origins in production
4. **Input Validation**: Validate all incoming message data
5. **User Authorization**: Implement proper authorization checks for sensitive operations

## Production Deployment

1. Set up proper JWT secret and verification
2. Configure CORS for your domain
3. Implement rate limiting
4. Set up monitoring and logging
5. Consider using Redis adapter for scaling across multiple server instances

## Troubleshooting

### Common Issues

1. **Connection Fails**: Check JWT token format and Authorization header
2. **Messages Not Delivered**: Verify user is connected and user ID is correct
3. **CORS Errors**: Configure CORS settings for your frontend domain

### Debug Mode

Enable debug logging by setting the DEBUG environment variable:
```bash
DEBUG=socket.io* npm start
```

## Integration with Existing Services

The WebSocket functionality integrates seamlessly with the existing notification service. You can send WebSocket messages when creating notifications to provide real-time updates to users.

Example integration:
```typescript
// After creating a notification in the database
const webSocketService = getWebSocketService();
webSocketService.sendNotification(userId, 'New Notification', notificationBody);
```
