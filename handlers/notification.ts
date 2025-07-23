import { primitives, utils, handlers } from '@nodeblocks/backend-sdk';
import { Result, ok, err } from 'neverthrow';

const { NodeblocksError } = primitives;
const { createBaseEntity } = utils;
const { mergeData } = handlers;

export const createNotification: primitives.AsyncRouteHandler<
  Result<primitives.RouteHandlerPayload, Error>
> = async payload => {
  const { params, context } = payload;
  const entity = createBaseEntity({
    ...params.requestBody,
    read: false,
    createdAt: Date.now(),
  });

  const res = await context.db.notifications.insertOne(entity);
  if (!res.insertedId) return err(new NodeblocksError(400, 'Notification failed'));

  return ok(mergeData(payload, { notificationId: entity.id }));
};

export const getUserNotifications: primitives.AsyncRouteHandler<
  Result<primitives.RouteHandlerPayload, Error>
> = async payload => {
  const { context, params } = payload;
  const userId = params.requestParams?.userId;
  const notifications = await context.db.notifications.find({ userId }).toArray();
  return ok(mergeData(payload, { notifications }));
};

export const normalizeNotificationCreate = (
  result: Result<primitives.RouteHandlerPayload, Error>
) => {
  if (result.isErr()) throw result.error;
  return {
    notificationId: result.value.context.data.notificationId,
    success: true
  };
};


export const normalizeNotificationList = (
  result: Result<primitives.RouteHandlerPayload, Error>
) => {
  if (result.isErr()) throw result.error;
  const notifications = result.value.context.data.notifications.map(({ _id, ...n }: any) => n);
  // Return a clean object without context
  return { notifications };
};
