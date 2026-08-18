import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { ISQSClient } from './interfaces/ISQSClient';
import { QueueMessage } from '../../shared/queueMessage';
import { appVariables } from '../../shared/appConfig';

export class QueueProcessor {
  constructor(protected sqsClient: ISQSClient = new SQSClient({})) {}

  public async send(message: QueueMessage): Promise<void> {
    try {
      await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: appVariables.QUEUE_URL,
          MessageBody: JSON.stringify(message),
        }),
      );
    } catch (error) {
      console.error(
        `Failed to publish message ${JSON.stringify({
          queueUrl: appVariables.QUEUE_URL,
          message: JSON.stringify(message),
          error,
        })}`,
      );
    }
  }
}
