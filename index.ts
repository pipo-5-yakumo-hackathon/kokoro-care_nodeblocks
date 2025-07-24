import express from "express";
import { createServer } from "http";

import { middlewares, drivers } from "@nodeblocks/backend-sdk";

const { nodeBlocksErrorMiddleware } = middlewares;

import { notificationService } from "./services/notification";
import { webSocketService } from "./services/websocketService";
import { initializeWebSocketService } from "./services/websocket";

const { getMongoClient } = drivers;

const client = getMongoClient("mongodb://localhost:27017", "dev");

const context = { notifications: client.collection("notifications") };

const app = express();
const server = createServer(app);

// Initialize WebSocket service
initializeWebSocketService(server);

app
  .use(express.json())
  .use(notificationService(context, {}))
  .use(webSocketService({}, {}))
  .use(nodeBlocksErrorMiddleware());

server.listen(8090, () => {
  console.log("Server running on port 8090");
  console.log("WebSocket endpoint available at ws://localhost:8090");
  console.log("Notifications service running");
});
