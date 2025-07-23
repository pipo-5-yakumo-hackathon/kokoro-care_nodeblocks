import { primitives } from '@nodeblocks/backend-sdk';
const { compose, lift, withRoute } = primitives;
import {
  createNotification,
  getUserNotifications,
  normalizeNotificationList,
  normalizeNotificationCreate,
} from '../handlers/notification';

export const postNotificationRoute = withRoute({
  method: 'POST',
  path: '/notifications',
  validators: [],
  handler: compose(createNotification, lift(normalizeNotificationCreate)),
});


export const getUserNotificationsRoute = withRoute({
  method: 'GET',
  path: '/notifications/:userId',
  validators: [],
  handler: compose(getUserNotifications, lift(normalizeNotificationList)),
});
