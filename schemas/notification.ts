import { primitives } from '@nodeblocks/backend-sdk';

const { withSchema } = primitives;

export const notification: primitives.SchemaDefinition = {
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

export const createNotificationSchema = withSchema({
  requestBody: {
    content: {
      'application/json': {
        schema: { ...notification, required: ['userId', 'title', 'message'] },
      },
    },
    required: true,
  },
});
