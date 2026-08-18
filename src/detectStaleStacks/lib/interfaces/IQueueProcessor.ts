import { QueueMessage } from '../../../shared/queueMessage';

export interface IQueueProcessor {
  send(message: QueueMessage): void;
}
