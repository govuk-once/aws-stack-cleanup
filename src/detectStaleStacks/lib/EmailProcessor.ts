import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { IStackReport } from './interfaces/IStackReport';
import { appVariables } from '../../shared/appConfig';
import { IEmailProcessor } from './interfaces/IEmailProcessor';

export class EmailProcessor implements IEmailProcessor {
  constructor(protected snsClient: SNSClient = new SNSClient({})) {}

  public buildEmail(stackReport: IStackReport[]): string {
    return 'not impletemted';
  }

  public async buildEmailAndSend(stackReport: IStackReport[]): Promise<void> {
    const emailMessage = this.buildEmail(stackReport);
    await this.sendEmail(emailMessage);
  }

  public async sendEmail(message: string): Promise<void> {
    try {
      await this.snsClient.send(
        new PublishCommand({
          TopicArn: appVariables.TOPIC_ARN,
          Subject: 'Stack Deletion Report',
          Message: message,
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
  }
}
