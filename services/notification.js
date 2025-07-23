"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const ramda_1 = require("ramda");
const backend_sdk_1 = require("@nodeblocks/backend-sdk");
const notification_1 = require("../features/notification");
const { compose, defService } = backend_sdk_1.primitives;
const notificationService = db => defService((0, ramda_1.partial)(compose(notification_1.getUserNotificationsFeature, notification_1.createNotificationFeature), [{ dataStores: db }]));
exports.notificationService = notificationService;
