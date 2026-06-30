import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { Stack } from '@aws-sdk/client-cloudformation';
import { IStackReport } from './interfaces/IStackReport';
import { appVariables } from '../../shared/appConfig';
import { DateHelper } from './DateHelper';
import { IEmailProcessor } from './interfaces/IEmailProcessor';
import {
  emailBody,
  emailAccountSection,
  emailTableBody,
  emailTableRow,
} from './emailTemplates';

export class EmailProcessor implements IEmailProcessor {
  protected dateHelper: DateHelper;

  constructor(protected snsClient: SNSClient = new SNSClient({})) {
    this.dateHelper = new DateHelper();
  }

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
    const accountSection = emailAccountSection
      .replace(
        '@doNotDeleteReport@',
        this.buildTable(stackReport.stacksNotToDelete),
      )
      .replace('@deleteReport@', this.buildTable(stackReport.stacksToDelete));
    return '';
  }

  private buildTable(details: Stack[]): string {
    const table = emailTableBody;
    let rows: string = '';
    details.forEach((data) => {
      const row = emailTableRow
        .replace('@stackName@', this.escapeHtml(data.StackName ?? 'Not Set'))
        .replace(
          '@lastUpDated@',
          this.escapeHtml(this.dateHelper.getFormatedLastTouchedDate(data)),
        )
        .replace(
          '@stackStatus@',
          this.escapeHtml(data.StackStatus ?? 'Not Known'),
        );
      rows += row;
    });

    return table.replace('@rows', rows);
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
