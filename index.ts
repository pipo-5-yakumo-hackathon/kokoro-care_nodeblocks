import express from 'express';

import { middlewares, drivers } from '@nodeblocks/backend-sdk';

const { nodeBlocksErrorMiddleware } = middlewares;

import { notificationService } from './services/notification';

const { getMongoClient } = drivers;

const client = getMongoClient('mongodb://localhost:27017', 'dev');

const context = { notifications: client.collection('notifications') };

express()
  .use(notificationService(context, {}))
  .use(nodeBlocksErrorMiddleware())
  .listen(8090, () => console.log('Notifications running'));