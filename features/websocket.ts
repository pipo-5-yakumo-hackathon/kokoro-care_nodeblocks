import { primitives } from "@nodeblocks/backend-sdk";
import {
  sendMessageToUserRoute,
  sendMessageToUsersRoute,
  broadcastMessageRoute,
  sendNotificationRoute,
  getConnectedUsersRoute,
  isUserConnectedRoute,
  disconnectUserRoute,
  getMyConnectionStatusRoute,
} from "../routes/websocket";

const { compose } = primitives;

export const webSocketMessagingFeature = compose(
  sendMessageToUserRoute,
  sendMessageToUsersRoute,
  broadcastMessageRoute,
  sendNotificationRoute,
);

export const webSocketConnectionFeature = compose(
  getConnectedUsersRoute,
  isUserConnectedRoute,
  disconnectUserRoute,
  getMyConnectionStatusRoute,
);
