import { IAccountManager } from '../shared/interfaces/IAccountManager';
import { IEmailProcessor } from './lib/interfaces/IEmailProcessor';
import { IStackManager } from './lib/interfaces/IStackManager';
import { IStackReport } from './lib/interfaces/IStackReport';
import { IQueueProcessor } from './lib/interfaces/IQueueProcessor';
import { AccountManager } from '../shared/accountManager';
import { DateHelper } from './lib/DateHelper';
import { EmailProcessor } from './lib/EmailProcessor';
import { StackManager } from './lib/stackManager';
import { QueueMessage } from '../shared/queueMessage';
import { Stack } from '@aws-sdk/client-cloudformation';
import { QueueProcessor } from './lib/QueueProcessor';
import { Account } from '../shared/infra-account-library';
import { CloudFormationClientFactory } from '../shared/CloudFormationClientFactory';

const APP_DEFAULTS = {
  environmentToProcess: 'dev',
  staleAfterDays: '60',
};

export class Processor {
  protected dateHelper: DateHelper;
  protected stackReports: IStackReport[];

  constructor(
    protected accountManager: IAccountManager = new AccountManager(),
    protected emailProcessor: IEmailProcessor = new EmailProcessor(),
    protected stackManager: IStackManager = new StackManager(
      new CloudFormationClientFactory(),
    ),
    protected queueProcessor: IQueueProcessor = new QueueProcessor(),
  ) {
    this.dateHelper = new DateHelper();
    this.stackReports = [];
  }

  public async Run(): Promise<void> {
    const accounts = this.accountManager.getDevelopmentAccounts();

    try {
      for (const account of accounts) {
        try {
          const stacks = await this.stackManager.getStacks('eu-west2');
          const stacksToProcess: Stack[] = [];
          const stacksNotToProcess: Stack[] = [];

          for (const stack of stacks) {
            try {
              if (
                this.hasTag(stack, process.env.ENVIRONMENT_TO_PROCESS || APP_DEFAULTS.environmentToProcess) &&
                !this.hasTag(stack, 'Retain') &&
                this.isOlderThanDays(
                  stack,
                  parseInt(process.env.STALE_AFTER_DAYS || APP_DEFAULTS.staleAfterDays, 10),
                )
              ) {
                stacksToProcess.push(stack);
              } else {
                stacksNotToProcess.push(stack);
              }
            } catch (error) {
              console.error(
                `Unable to process stack ${stack.StackName} due to ${JSON.stringify(error)}`,
              );
            }
          }

          if (process.env.DRY_RUN && process.env.DRY_RUN.toString().toLowerCase() === 'true') {
            // DRY_RUN is enabled, skip actual deletions
          } else {
            await this.sendToBeDeleted(
              account,
              stacksToProcess,
              'eu-west2',
            );
          }

          this.stackReports.push({
            accountName: account.name,
            accountNumber: account.id,
            stacksToDelete: stacksToProcess,
            stacksNotToDelete: stacksNotToProcess,
          });
        } catch (error) {
          console.error(`Error occurred while processing stacks for account ${account.name}: ${JSON.stringify(error)}`);
        }
      }
    } finally {
      await this.emailProcessor.buildEmailAndSend(
        this.stackReports,
        new Date(),
      );
    }
  }

  protected async sendToBeDeleted(
    account: Account,
    stacks: Stack[],
    region: string,
  ): Promise<void> {
    const orderedStacks = await this.stackManager.getDeletionOrder(
      stacks,
      region,
    );
    await Promise.all(orderedStacks.map(async (stack) => {
      const message: QueueMessage = {
        correlationId: crypto.randomUUID(),
        batchId: crypto.randomUUID(),
        accountId: account.id,
        accountName: account.name,
        region: 'eu-west2',
        stackName: stack.stackName,
        deleteOrder: 1,
        reason: `Has not been updated for over ${process.env.STALE_AFTER_DAYS || APP_DEFAULTS.staleAfterDays} days`,
        lastTouched: this.dateHelper.getFormatedLastTouchedDate(
          stacks.find((s) => s.StackName === stack.stackName),
        ),
      };
      await this.queueProcessor.send(message);
    }));
  }

  protected hasTag(stack: Stack, tagName: string): boolean {
    return stack.Tags?.some((tag) => tag.Key === tagName) ?? false;
  }

  protected isOlderThanDays(stack: Stack, days: number): boolean {
    const referenceDate = this.dateHelper.getLastTouchedDate(stack);

    if (!referenceDate) {
      return false;
    }

    const now = new Date();

    const stackAgeMS = now.getTime() - referenceDate.getTime();
    const stackAgeDays = stackAgeMS / (1000 * 60 * 60 * 24);

    return stackAgeDays > days;
  }
}
