import { partial } from 'ramda';
import { primitives } from '@nodeblocks/backend-sdk';
import {
  createNotificationFeature,
  getUserNotificationsFeature,
} from '../features/notification';

const { compose, defService } = primitives;

export const notificationService: primitives.Service = db =>
  defService(
    partial(
      compose(
        getUserNotificationsFeature,
        createNotificationFeature
      ),
      [{ dataStores: db }]
    )
  );
