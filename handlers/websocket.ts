import { primitives, handlers } from "@nodeblocks/backend-sdk";
import { Result, ok, err } from "neverthrow";
import { getWebSocketService } from "../services/websocket";
import { extractUserIdFromAuthHeader, JWTError } from "../utils/jwt";

const { NodeblocksError } = primitives;
const { mergeData } = handlers;

export interface SendMessageRequest {
  userId: string;
  type: string;
  data: any;
}

export interface SendMessageToUsersRequest {
  userIds: string[];
  type: string;
  data: any;
}

export interface BroadcastMessageRequest {
  type: string;
  data: any;
}

export interface SendNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: any;
}

/**
 * Send a message to a specific user via WebSocket
 */
export const sendMessageToUser: primitives.AsyncRouteHandler<
  Result<primitives.RouteHandlerPayload, Error>
> = async (payload) => {
  try {
    const { userId, type, data } = payload.params
      .requestBody as SendMessageRequest;

    if (!userId || !type) {
      return err(
        new NodeblocksError(400, "Missing required fields: userId, type"),
      );
    }

    const webSocketService = getWebSocketService();
    const success = webSocketService.sendMessageToUser(userId, { type, data });

    if (success) {
      return ok(
        mergeData(payload, {
          success: true,
          message: `ADSDASSADMessage sent to user ${userId}`,
          timestamp: new Date(),
        }),
      );
    } else {
      return err(new NodeblocksError(404, `User ${userId} is not connected`));
    }
  } catch (error) {
    console.error("Error sending message to user:", error);
    return err(new NodeblocksError(500, "Internal server error"));
  }
};

/**
 * Send a message to multiple users via WebSocket
 */
export const sendMessageToUsers: primitives.AsyncRouteHandler<
  Result<primitives.RouteHandlerPayload, Error>
> = async (payload) => {
  try {
    const { userIds, type, data } = payload.params
      .requestBody as SendMessageToUsersRequest;

    if (!userIds || !Array.isArray(userIds) || !type) {
      return err(
        new NodeblocksError(
          400,
          "Missing required fields: userIds (array), type",
        ),
      );
    }

    const webSocketService = getWebSocketService();
    const deliveredTo = webSocketService.sendMessageToUsers(userIds, {
      type,
      data,
    });

    return ok(
      mergeData(payload, {
        success: true,
        message: `Message sent to ${deliveredTo.length} out of ${userIds.length} users`,
        deliveredTo,
        notDeliveredTo: userIds.filter((id) => !deliveredTo.includes(id)),
        timestamp: new Date(),
      }),
    );
  } catch (error) {
    console.error("Error sending message to users:", error);
    return err(new NodeblocksError(500, "Internal server error"));
  }
};

/**
 * Broadcast a message to all connected users
 */
export const broadcastMessage: primitives.AsyncRouteHandler<
  Result<primitives.RouteHandlerPayload, Error>
> = async (payload) => {
  try {
    const { type, data } = payload.params
      .requestBody as BroadcastMessageRequest;

    if (!type) {
      return err(new NodeblocksError(400, "Missing required field: type"));
    }

    const webSocketService = getWebSocketService();
    const userCount = webSocketService.broadcastMessage({ type, data });

    return ok(
      mergeData(payload, {
        success: true,
        message: `Message broadcasted to ${userCount} users`,
        userCount,
        timestamp: new Date(),
      }),
    );
  } catch (error) {
    console.error("Error broadcasting message:", error);
    return err(new NodeblocksError(500, "Internal server error"));
  }
};

/**
 * Send a notification to a specific user
 */
export const sendNotification: primitives.AsyncRouteHandler<
  Result<primitives.RouteHandlerPayload, Error>
> = async (payload) => {
  try {
    const { userId, title, body, data } = payload.params
      .requestBody as SendNotificationRequest;

    if (!userId || !title || !body) {
      return err(
        new NodeblocksError(
          400,
          "Missing required fields: userId, title, body",
        ),
      );
    }

    const webSocketService = getWebSocketService();
    const success = webSocketService.sendNotification(
      userId,
      title,
      body,
      data,
    );

    if (success) {
      return ok(
        mergeData(payload, {
          success: true,
          message: `Notification sent to user ${userId}`,
          timestamp: new Date(),
        }),
      );
    } else {
      return err(new NodeblocksError(404, `User ${userId} is not connected`));
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    return err(new NodeblocksError(500, "Internal server error"));
  }
};

/**
 * Get all connected users
 */
export const getConnectedUsers: primitives.AsyncRouteHandler<
  Result<primitives.RouteHandlerPayload, Error>
> = async (payload) => {
  try {
    const webSocketService = getWebSocketService();
    const connectedUsers = webSocketService.getConnectedUsers();
    const userCount = webSocketService.getConnectedUserCount();

    return ok(
      mergeData(payload, {
        success: true,
        connectedUsers,
        userCount,
        timestamp: new Date(),
      }),
    );
  } catch (error) {
    console.error("Error getting connected users:", error);
    return err(new NodeblocksError(500, "Internal server error"));
  }
};

/**
 * Check if a specific user is connected
 */
export const isUserConnected: primitives.AsyncRouteHandler<
  Result<primitives.RouteHandlerPayload, Error>
> = async (payload) => {
  try {
    const userId = payload.params.requestParams?.userId;

    if (!userId) {
      return err(new NodeblocksError(400, "Missing userId parameter"));
    }

    const webSocketService = getWebSocketService();
    const isConnected = webSocketService.isUserConnected(userId);
    const connectionInfo = webSocketService.getUserConnection(userId);

    return ok(
      mergeData(payload, {
        success: true,
        userId,
        isConnected,
        connectionInfo: isConnected
          ? {
              connectedAt: connectionInfo?.connectedAt,
              socketId: connectionInfo?.socket.id,
            }
          : null,
        timestamp: new Date(),
      }),
    );
  } catch (error) {
    console.error("Error checking user connection:", error);
    return err(new NodeblocksError(500, "Internal server error"));
  }
};

/**
 * Disconnect a specific user
 */
export const disconnectUser: primitives.AsyncRouteHandler<
  Result<primitives.RouteHandlerPayload, Error>
> = async (payload) => {
  try {
    const userId = payload.params.requestParams?.userId;

    if (!userId) {
      return err(new NodeblocksError(400, "Missing userId parameter"));
    }

    const webSocketService = getWebSocketService();
    const success = webSocketService.disconnectUser(userId);

    if (success) {
      return ok(
        mergeData(payload, {
          success: true,
          message: `User ${userId} disconnected`,
          timestamp: new Date(),
        }),
      );
    } else {
      return err(new NodeblocksError(404, `User ${userId} is not connected`));
    }
  } catch (error) {
    console.error("Error disconnecting user:", error);
    return err(new NodeblocksError(500, "Internal server error"));
  }
};

/**
 * Get current user's connection status (from JWT token)
 */
export const getMyConnectionStatus: primitives.AsyncRouteHandler<
  Result<primitives.RouteHandlerPayload, Error>
> = async (payload) => {
  try {
    const authHeader = payload.context.req?.headers?.authorization;
    const userId = extractUserIdFromAuthHeader(authHeader);

    const webSocketService = getWebSocketService();
    const isConnected = webSocketService.isUserConnected(userId);
    const connectionInfo = webSocketService.getUserConnection(userId);

    return ok(
      mergeData(payload, {
        success: true,
        userId,
        isConnected,
        connectionInfo: isConnected
          ? {
              connectedAt: connectionInfo?.connectedAt,
              socketId: connectionInfo?.socket.id,
            }
          : null,
        timestamp: new Date(),
      }),
    );
  } catch (error) {
    if (error instanceof JWTError) {
      return err(
        new NodeblocksError(401, `Authentication failed: ${error.message}`),
      );
    } else {
      console.error("Error getting user connection status:", error);
      return err(new NodeblocksError(500, "Internal server error"));
    }
  }
};

// Normalizer functions for responses
export const normalizeWebSocketResponse = (
  result: Result<primitives.RouteHandlerPayload, Error>,
) => {
  if (result.isErr()) throw result.error;
  return result.value.context.data;
};
