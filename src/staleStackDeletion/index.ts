import { SQSEvent } from 'aws-lambda';
import { appVariables } from '../shared/appConfig';
import { QueueMessage } from '../shared/queueMessage';
import { Processor } from './Processor';
import { AccountManager } from '../shared/accountManager';

export const handler = async (event: SQSEvent) => {
  console.log(`queue ${appVariables.QUEUE_NAME} triggered lambda`);

  let recordCount: number = 0;

  const processor: Processor = new Processor(new AccountManager({}));

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body) as QueueMessage;

      console.log(`Recieved message ${JSON.stringify(message)} processing`);
      await processor.run(message);
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
