import { SendMessageCommand } from '@aws-sdk/client-sqs';

export interface ISQSClient {
  send(command: SendMessageCommand): Promise<void>;
}
