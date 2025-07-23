"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const backend_sdk_1 = require("@nodeblocks/backend-sdk");
const { nodeBlocksErrorMiddleware } = backend_sdk_1.middlewares;
const notification_1 = require("./services/notification");
const { getMongoClient } = backend_sdk_1.drivers;
const client = getMongoClient('mongodb://localhost:27017', 'dev');
const context = { notifications: client.collection('notifications') };
(0, express_1.default)()
    .use((0, notification_1.notificationService)(context, {}))
    .use(nodeBlocksErrorMiddleware())
    .listen(8090, () => console.log('Notifications running'));
