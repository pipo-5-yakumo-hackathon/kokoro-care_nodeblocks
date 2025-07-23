import { primitives } from '@nodeblocks/backend-sdk';
import {
  postNotificationRoute,
  getUserNotificationsRoute,
} from '../routes/notification';
import { createNotificationSchema } from '../schemas/notification';

const { compose } = primitives;

export const createNotificationFeature = compose(
  createNotificationSchema,
  postNotificationRoute
);
export const getUserNotificationsFeature = getUserNotificationsRoute;
