import { IAccountManager } from './lib/interfaces/IAccountManager';
import { IEmailProcessor } from './lib/interfaces/IEmailProcessor';
import { IStackManager } from './lib/interfaces/IStackManager';
import { IQueueProcessor } from './lib/interfaces/IQueueProcessor';
import { AccountManager } from './lib/accountManager';
import { DateHelper } from './lib/DateHelper';
import { EmailProcessor } from './lib/EmailProcessor';
import { StackManager } from './lib/stackManager';
import { appVariables } from '../shared/appConfig';
import { QueueMessage } from '../shared/queueMessage';
import { Stack } from '@aws-sdk/client-cloudformation';
import { QueueProcessor } from './lib/QueueProcessor';
import { Account } from './lib/infra-account-library';

export class Processor {
  protected dateHelper: DateHelper;

  constructor(
    protected accountManager: IAccountManager = new AccountManager(),
    protected emailProcessor: IEmailProcessor = new EmailProcessor(),
    protected stackManager: IStackManager = new StackManager(),
    protected queueProcessor: IQueueProcessor = new QueueProcessor(),
  ) {
    this.dateHelper = new DateHelper();
  }

  public async Run(): Promise<void> {
    const accounts = this.accountManager.getDevelopmentAccounts();

    accounts.forEach(async (account) => {
      const role = await this.accountManager.assumeRole(
        account.id,
        appVariables.ROLE_TO_ASSUME,
      );

      if (role.valid) {
        await this.processStacks(account);
      } else {
        console.warn(
          `Unable to assume role ${appVariables.ROLE_TO_ASSUME} for account ${account.name}:${account.id}`,
        );
      }
    });
  }

  protected async processStacks(account: Account): Promise<void> {
    const stacks = await this.stackManager.getStacks();
    const stacksToProcess: Stack[] = [];
    const stacksNotToProcess: Stack[] = [];

    stacks.forEach((stack) => {
      if (
        this.hasTag(stack, appVariables.ENVIRONMENT_TO_PROCESS) &&
        !this.hasTag(stack, 'Retain') &&
        this.isOlderThanDays(stack, parseInt(appVariables.STALE_AFTER_DAYS, 10))
      ) {
        stacksToProcess.push(stack);
      } else {
        stacksNotToProcess.push(stack);
      }
    });

    try {
      if (
        appVariables.DRY_RUN &&
        appVariables.DRY_RUN.toLowerCase() === 'true'
      ) {
        await this.sendToBeReported(account, stacksNotToProcess);
      } else {
        this.sendToBeReported(account, stacksNotToProcess);
        await this.sendToBeDeleted(account, stacksToProcess);
      }
    } finally {
      this.emailProcessor.sendEmail();
    }
  }

  protected async sendToBeDeleted(
    account: Account,
    stacks: Stack[],
  ): Promise<void> {
    const orderedStacks = await this.stackManager.getDeletionOrder(stacks);
    orderedStacks.forEach(async (stack) => {
      const message: QueueMessage = {
        correlationId: crypto.randomUUID(),
        batchId: crypto.randomUUID(),
        accountId: account.id,
        accountName: account.name,
        region: 'eu-west2',
        stackName: stack.stackName,
        deleteOrder: 1,
        reason: `Has not been updated for over ${appVariables.STALE_AFTER_DAYS} days`,
        lastTouched: this.dateHelper.getFormatedLastTouchedDate(
          stacks.find((s) => s.StackName === stack.stackName),
        ),
      };
      await this.queueProcessor.send(message);
    });
  }

  protected sendToBeReported(account: Account, stacks: Stack[]) {}

  protected hasTag(stack: Stack, tagName: String): boolean {
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
