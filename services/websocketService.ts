import { partial } from 'ramda';
import { primitives } from '@nodeblocks/backend-sdk';
import {
  webSocketMessagingFeature,
  webSocketConnectionFeature,
} from '../features/websocket';

const { compose, defService } = primitives;

export const webSocketService: primitives.Service = () =>
  defService(
    partial(
      compose(
        webSocketMessagingFeature,
        webSocketConnectionFeature
      ),
      [{}]
    )
  );
