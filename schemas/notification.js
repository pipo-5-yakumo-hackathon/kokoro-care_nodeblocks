"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationSchema = exports.notification = void 0;
const backend_sdk_1 = require("@nodeblocks/backend-sdk");
const { withSchema } = backend_sdk_1.primitives;
exports.notification = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    additionalProperties: false,
    type: 'object',
    properties: {
        userId: { type: 'string' },
        title: { type: 'string' },
        message: { type: 'string' },
        read: { type: 'boolean' },
    },
};
exports.createNotificationSchema = withSchema({
    requestBody: {
        content: {
            'application/json': {
                schema: Object.assign(Object.assign({}, exports.notification), { required: ['userId', 'title', 'message'] }),
            },
        },
        required: true,
    },
});
