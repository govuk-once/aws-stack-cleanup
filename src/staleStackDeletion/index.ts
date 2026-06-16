import { SQSEvent } from 'aws-lambda';
import { appVariables } from './shared/appConfig';
import { QueueMessage } from './shared/queueMessage';

export const handler = async (event: SQSEvent) => {
  console.log(`queue ${appVariables.QUEUE_NAME} triggered lambda`);

  let recordCount: number = 0;

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body) as QueueMessage;

      console.log(`Recieved message ${JSON.stringify(message)}`);
      recordCount++;

      // this is where the process heppens
    } catch (error) {
      console.log(
        `Failed to process message ${JSON.stringify({
          messageid: record.messageId,
          error,
        })}`,
      );
    }
  }

  console.log(`Completed processing: ${recordCount} messages processed`);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `processed ${recordCount} messages`,
      timeProcessed: new Date().toLocaleString('en-GB', {
        timeZone: 'Europe/London',
      }),
    }),
  };
};
