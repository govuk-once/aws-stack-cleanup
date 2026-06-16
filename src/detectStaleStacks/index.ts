import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

import { appVariables } from '../shared/appConfig';
import { QueueMessage } from '../shared/queueMessage';

export const handler = async () => {
  console.log('Seeking stale stacks');

  const sns = new SNSClient({});
  const sqsClient = new SQSClient({});

  const message: QueueMessage = {
    correlationId: crypto.randomUUID(),
    batchId: crypto.randomUUID(),
    accountId: '12345678',
    accountName: 'testing',
    region: 'eu-west2',
    stackName: 'old stack',
    deleteOrder: 1,
    reason: 'can I send',
    lastTouched: `${Date.now()}`,
  };

  try {
    await sqsClient.send(
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

  try {
    await sns.send(
      new PublishCommand({
        TopicArn: appVariables.TOPIC_ARN,
        Subject: 'Stack Deletion Report',
        Message: 'Found things to delete',
      }),
    );
  } catch (error) {
    console.error(
      `Failed to send email ${JSON.stringify({
        topicArn: appVariables.TOPIC_ARN,
        error,
      })}`,
    );
  }

  console.log(`Completed looking for stale stacks`);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message:
        'And is a goodnight from him, the time is ' +
        new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }),
    }),
  };
};
