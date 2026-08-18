import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { appVariables } from '../shared/appConfig';
import { Processor } from './Processor';

export const handler = async () => {
  console.log('Seeking stale stacks');

  const sns = new SNSClient({});

  try {
    const processor = new Processor();
    processor.Run();
  } catch (error) {
    console.error(
      `Failed to run processor ${JSON.stringify({
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
      message: 'OK',
    }),
  };
};
