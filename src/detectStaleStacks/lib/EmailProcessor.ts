import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { Stack } from '@aws-sdk/client-cloudformation';
import { IStackReport } from './interfaces/IStackReport';
import { ISNSClient } from './interfaces/ISNSClient';
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

  constructor(protected snsClient: ISNSClient = new SNSClient({})) {
    this.dateHelper = new DateHelper();
  }

  public buildEmail(stackReport: IStackReport[], date: Date): string {
    let email = emailBody;
    email = email.replace('@date@', date.toISOString());
    let report: string = '';

    stackReport.forEach((account) => {
      report += this.buildAccountSection(account);
    });

    email = email.replace('@report@', report);
    return email;
  }

  public async buildEmailAndSend(
    stackReport: IStackReport[],
    date: Date = new Date(),
  ): Promise<string> {
    const emailMessage = this.buildEmail(stackReport, date);
    await this.sendEmail(emailMessage);
    return emailMessage;
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
      .replace('@deleteReport@', this.buildTable(stackReport.stacksToDelete))
      .replace('@accountName@', stackReport.accountName)
      .replace('@accountNumber@', stackReport.accountNumber);
    return accountSection;
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

    return table.replace('@rows@', rows);
  }

  private escapeHtml(item: string): string {
    return item
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039');
  }
}
