import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { IStackReport } from './interfaces/IStackReport';
import { appVariables } from '../../shared/appConfig';
import { IEmailProcessor } from './interfaces/IEmailProcessor';
import {
  emailBody,
  emailAccountSection,
  emailTableBody,
  emailTableRow,
} from './emailTemplates';

export class EmailProcessor implements IEmailProcessor {
  constructor(protected snsClient: SNSClient = new SNSClient({})) {}

  public buildEmail(stackReport: IStackReport[]): string {
    let email = emailBody;
    email = email.replace('@date@', new Date().toISOString());
    email = email.replace(
      '@report@',
      stackReport.map((account) => this.buildAccountSection(account)).join(''),
    );
    return email;
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

  private buildAccountSection(stackReport: IStackReport): string {
    return '';
  }

  private escapeHtml(item: string): string {
    return item
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '@quot')
      .replace(/'/g, '&#039');
  }
}
