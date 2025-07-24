# WebSocket Implementation Summary

## Overview

This document provides a comprehensive overview of the WebSocket functionality implemented in the kokoro-care_nodeblocks project. The implementation provides real-time bidirectional communication between the server and clients, with JWT-based user authentication and user-specific message targeting.

## Architecture

### Core Components

1. **WebSocket Service** (`services/websocket.ts`)
   - Main WebSocket service class managing Socket.IO server
   - Handles user authentication and connection mapping
   - Provides methods for message sending and connection management

2. **WebSocket Service Module** (`services/websocketService.ts`)
   - Service definition following NodeBlocks pattern
   - Composes WebSocket features for the main application

3. **JWT Utilities** (`utils/jwt.ts`)
   - JWT token parsing and validation
   - User ID extraction from token `sub` field
   - Custom error handling for authentication issues

4. **WebSocket Handlers** (`handlers/websocket.ts`)
   - NodeBlocks-compliant route handlers
   - HTTP API endpoints for WebSocket operations
   - Error handling and response normalization

5. **WebSocket Routes** (`routes/websocket.ts`)
   - Route definitions using NodeBlocks `withRoute` pattern
   - Handler composition with normalizers

6. **WebSocket Features** (`features/websocket.ts`)
   - Feature composition following NodeBlocks architecture
   - Groups related functionality into logical features

## Key Features

### User Authentication
- JWT-based authentication from Authorization header
- User ID extraction from token `sub` field
- Automatic disconnection of existing connections for same user
- Authentication validation on connection

### Connection Management
- Socket mapping by user ID (one connection per user)
- Connection tracking with timestamps
- Automatic cleanup on disconnection
- Connection health monitoring with ping/pong

### Message Types
- **User Messages**: Send to specific user by ID
- **Multi-user Messages**: Send to multiple users
- **Broadcast Messages**: Send to all connected users
- **Notifications**: Structured notification messages
- **Custom Messages**: Flexible message format support

### HTTP API Integration
- RESTful endpoints for WebSocket operations
- Send messages without WebSocket connection
- Query connection status and user lists
- Administrative operations (disconnect users)

## WebSocket Server Configuration

### Connection Settings
```typescript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",  // Configure for production
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});
```

### Authentication Flow
1. Client connects with JWT token in Authorization header
2. Server validates token and extracts user ID
3. Existing connections for same user are disconnected
4. New connection is mapped to user ID
5. Authentication confirmation sent to client

## HTTP API Endpoints

### Messaging Endpoints
- `POST /websocket/message/user` - Send message to specific user
- `POST /websocket/message/users` - Send message to multiple users
- `POST /websocket/message/broadcast` - Broadcast to all users
- `POST /websocket/notification` - Send notification to user

### Connection Management
- `GET /websocket/users/connected` - List connected users
- `GET /websocket/users/:userId/status` - Check user connection
- `DELETE /websocket/users/:userId/disconnect` - Disconnect user
- `GET /websocket/me/status` - Get own connection status

## Message Structure

### Standard Message Format
```typescript
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: Date;
}
```

### Notification Message
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

### System Message
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

## Client Integration

### Connection Example
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
```

### Event Handling
- `connect` - Connection established
- `authenticated` - Authentication successful
- `message` - Incoming message
- `pong` - Response to ping
- `disconnect` - Connection closed

## Testing Resources

### Test Files Created
1. `websocket-client.html` - Interactive browser client
2. `testing-websocket.http` - HTTP REST client tests
3. Sample JWT tokens for testing multiple users

### Sample JWT Tokens
- **User 123**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
- **User 456**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyNDU2IiwibmFtZSI6IkphbmUgU21pdGgiLCJpYXQiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ`
- **User 789**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyNzg5IiwibmFtZSI6IkJvYiBKb2huc29uIiwiaWF0IjoxNTE2MjM5MDIyfQ.onuUeVV4KP5zV8TLMVhQUedo9P9zGUz2hKhP0YoWJIQ`

## Dependencies Added

### Production Dependencies
- `socket.io`: WebSocket server implementation
- `jsonwebtoken`: JWT token handling

### Development Dependencies
- `@types/jsonwebtoken`: TypeScript definitions

## Server Integration

### Main Server Changes (`index.ts`)
1. Created HTTP server instance for Socket.IO
2. Initialized WebSocket service
3. Added WebSocket service routes
4. Added JSON parsing middleware

### Service Composition
```typescript
app
  .use(express.json())
  .use(notificationService(context, {}))
  .use(webSocketService({}, {}))
  .use(nodeBlocksErrorMiddleware());
```

## Usage Examples

### Send Message via API
```bash
curl -X POST http://localhost:8090/websocket/message/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "userId": "user123",
    "type": "chat",
    "data": {"message": "Hello!"}
  }'
```

### Send Notification
```bash
curl -X POST http://localhost:8090/websocket/notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "userId": "user123",
    "title": "New Message",
    "body": "You have a new message"
  }'
```

### Check Connected Users
```bash
curl -X GET http://localhost:8090/websocket/users/connected \
  -H "Authorization: Bearer YOUR_JWT"
```

## Security Considerations

### Current Implementation
- JWT token validation (decode only, no signature verification)
- CORS configured for all origins (development mode)
- Basic input validation

### Production Recommendations
1. **JWT Verification**: Implement proper JWT signature verification
2. **CORS Configuration**: Restrict origins to your frontend domains
3. **Rate Limiting**: Implement rate limiting for message sending
4. **Input Validation**: Add comprehensive input validation
5. **Authentication**: Add proper authorization checks
6. **Connection Limits**: Implement connection limits per user/IP

## Performance Considerations

### Current Implementation
- Single server instance
- In-memory connection storage
- No persistence layer

### Scaling Recommendations
1. **Redis Adapter**: Use Redis adapter for multi-server scaling
2. **Connection Pooling**: Implement connection pooling
3. **Message Queuing**: Add message queuing for reliability
4. **Load Balancing**: Configure sticky sessions for load balancing

## Error Handling

### WebSocket Errors
- Connection authentication failures
- Invalid JWT tokens
- User disconnections
- Message delivery failures

### HTTP API Errors
- 400: Bad Request (missing parameters)
- 401: Unauthorized (JWT issues)
- 404: Not Found (user not connected)
- 500: Internal Server Error

## Integration with Existing Services

The WebSocket functionality integrates seamlessly with the existing notification service. You can enhance notifications by sending real-time WebSocket messages:

```typescript
// After creating a notification in database
const webSocketService = getWebSocketService();
webSocketService.sendNotification(userId, 'New Notification', notificationBody);
```

## Monitoring and Debugging

### Debug Mode
```bash
DEBUG=socket.io* npx ts-node index.ts
```

### Connection Monitoring
- Connection/disconnection logging
- Message delivery tracking
- Error logging and reporting
- Connection statistics available via API

## Future Enhancements

### Potential Features
1. **Message History**: Store and retrieve message history
2. **Room-based Messaging**: Group messaging functionality
3. **File Sharing**: File upload/download via WebSocket
4. **Typing Indicators**: Real-time typing status
5. **Message Acknowledgments**: Delivery confirmations
6. **Offline Message Queue**: Queue messages for offline users

### Technical Improvements
1. **Message Persistence**: Database storage for messages
2. **Connection Recovery**: Auto-reconnection with state recovery
3. **Message Compression**: Implement message compression
4. **Analytics**: Connection and message analytics
5. **Admin Dashboard**: Real-time connection monitoring UI

## Troubleshooting

### Common Issues
1. **Connection Refused**: Check server is running on port 8090
2. **Authentication Failed**: Verify JWT token format and content
3. **CORS Errors**: Configure CORS for your frontend domain
4. **Messages Not Delivered**: Check user connection status

### Debug Steps
1. Check server logs for connection attempts
2. Verify JWT token contains 'sub' field
3. Test with provided HTML client
4. Use browser developer tools for WebSocket debugging

This implementation provides a solid foundation for real-time communication in your application with room for future enhancements and production hardening.