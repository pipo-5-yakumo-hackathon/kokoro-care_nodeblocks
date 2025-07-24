"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const backend_sdk_1 = require("@nodeblocks/backend-sdk");
const { nodeBlocksErrorMiddleware } = backend_sdk_1.middlewares;
const notification_1 = require("./services/notification");
const websocketService_1 = require("./services/websocketService");
const websocket_1 = require("./services/websocket");
const { getMongoClient } = backend_sdk_1.drivers;
const client = getMongoClient("mongodb://localhost:27017", "dev");
const context = { notifications: client.collection("notifications") };
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Initialize WebSocket service
(0, websocket_1.initializeWebSocketService)(server);
app
    .use(express_1.default.json())
    .use((0, notification_1.notificationService)(context, {}))
    .use((0, websocketService_1.webSocketService)({}, {}))
    .use(nodeBlocksErrorMiddleware());
server.listen(8090, () => {
    console.log("Server running on port 8090");
    console.log("WebSocket endpoint available at ws://localhost:8090");
    console.log("Notifications service running");
});
