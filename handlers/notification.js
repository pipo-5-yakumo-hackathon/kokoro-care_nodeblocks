"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeNotificationList = exports.normalizeNotificationCreate = exports.getUserNotifications = exports.createNotification = void 0;
const backend_sdk_1 = require("@nodeblocks/backend-sdk");
const neverthrow_1 = require("neverthrow");
const { NodeblocksError } = backend_sdk_1.primitives;
const { createBaseEntity } = backend_sdk_1.utils;
const { mergeData } = backend_sdk_1.handlers;
const createNotification = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { params, context } = payload;
    const entity = createBaseEntity(Object.assign(Object.assign({}, params.requestBody), { read: false, createdAt: Date.now() }));
    const res = yield context.db.notifications.insertOne(entity);
    if (!res.insertedId)
        return (0, neverthrow_1.err)(new NodeblocksError(400, 'Notification failed'));
    return (0, neverthrow_1.ok)(mergeData(payload, { notificationId: entity.id }));
});
exports.createNotification = createNotification;
const getUserNotifications = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { context, params } = payload;
    const userId = (_a = params.requestParams) === null || _a === void 0 ? void 0 : _a.userId;
    const notifications = yield context.db.notifications.find({ userId }).toArray();
    return (0, neverthrow_1.ok)(mergeData(payload, { notifications }));
});
exports.getUserNotifications = getUserNotifications;
const normalizeNotificationCreate = (result) => {
    if (result.isErr())
        throw result.error;
    return {
        notificationId: result.value.context.data.notificationId,
        success: true
    };
};
exports.normalizeNotificationCreate = normalizeNotificationCreate;
const normalizeNotificationList = (result) => {
    if (result.isErr())
        throw result.error;
    const notifications = result.value.context.data.notifications.map((_a) => {
        var { _id } = _a, n = __rest(_a, ["_id"]);
        return n;
    });
    // Return a clean object without context
    return { notifications };
};
exports.normalizeNotificationList = normalizeNotificationList;
