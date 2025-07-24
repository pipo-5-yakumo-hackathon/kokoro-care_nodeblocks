import { primitives } from "@nodeblocks/backend-sdk";
const { compose, lift, withRoute } = primitives;
import {
  sendMessageToUser,
  sendMessageToUsers,
  broadcastMessage,
  sendNotification,
  getConnectedUsers,
  isUserConnected,
  disconnectUser,
  getMyConnectionStatus,
  normalizeWebSocketResponse,
} from "../handlers/websocket";

export const sendMessageToUserRoute = withRoute({
  method: "POST",
  path: "/websocket/message/user",
  validators: [],
  handler: compose(sendMessageToUser, lift(normalizeWebSocketResponse)),
});

export const sendMessageToUsersRoute = withRoute({
  method: "POST",
  path: "/websocket/message/users",
  validators: [],
  handler: compose(sendMessageToUsers, lift(normalizeWebSocketResponse)),
});

export const broadcastMessageRoute = withRoute({
  method: "POST",
  path: "/websocket/message/broadcast",
  validators: [],
  handler: compose(broadcastMessage, lift(normalizeWebSocketResponse)),
});

export const sendNotificationRoute = withRoute({
  method: "POST",
  path: "/websocket/notification",
  validators: [],
  handler: compose(sendNotification, lift(normalizeWebSocketResponse)),
});

export const getConnectedUsersRoute = withRoute({
  method: "GET",
  path: "/websocket/users/connected",
  validators: [],
  handler: compose(getConnectedUsers, lift(normalizeWebSocketResponse)),
});

export const isUserConnectedRoute = withRoute({
  method: "GET",
  path: "/websocket/users/:userId/status",
  validators: [],
  handler: compose(isUserConnected, lift(normalizeWebSocketResponse)),
});

export const disconnectUserRoute = withRoute({
  method: "DELETE",
  path: "/websocket/users/:userId/disconnect",
  validators: [],
  handler: compose(disconnectUser, lift(normalizeWebSocketResponse)),
});

export const getMyConnectionStatusRoute = withRoute({
  method: "GET",
  path: "/websocket/me/status",
  validators: [],
  handler: compose(getMyConnectionStatus, lift(normalizeWebSocketResponse)),
});
