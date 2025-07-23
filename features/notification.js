"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserNotificationsFeature = exports.createNotificationFeature = void 0;
const backend_sdk_1 = require("@nodeblocks/backend-sdk");
const notification_1 = require("../routes/notification");
const notification_2 = require("../schemas/notification");
const { compose } = backend_sdk_1.primitives;
exports.createNotificationFeature = compose(notification_2.createNotificationSchema, notification_1.postNotificationRoute);
exports.getUserNotificationsFeature = notification_1.getUserNotificationsRoute;
