"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserNotificationsRoute = exports.postNotificationRoute = void 0;
const backend_sdk_1 = require("@nodeblocks/backend-sdk");
const { compose, lift, withRoute } = backend_sdk_1.primitives;
const notification_1 = require("../handlers/notification");
exports.postNotificationRoute = withRoute({
    method: 'POST',
    path: '/notifications',
    validators: [],
    handler: compose(notification_1.createNotification, lift(notification_1.normalizeNotificationCreate)),
});
exports.getUserNotificationsRoute = withRoute({
    method: 'GET',
    path: '/notifications/:userId',
    validators: [],
    handler: compose(notification_1.getUserNotifications, lift(notification_1.normalizeNotificationList)),
});
