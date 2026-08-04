import { IAccountManager } from '../shared/interfaces/IAccountManager';
import { IEmailProcessor } from './lib/interfaces/IEmailProcessor';
import { IStackManager } from './lib/interfaces/IStackManager';
import { IStackReport } from './lib/interfaces/IStackReport';
import { IQueueProcessor } from './lib/interfaces/IQueueProcessor';
import { AccountManager } from '../shared/accountManager';
import { DateHelper } from './lib/DateHelper';
import { EmailProcessor } from './lib/EmailProcessor';
import { StackManager } from './lib/stackManager';
import { appVariables } from '../shared/appConfig';
import { QueueMessage } from '../shared/queueMessage';
import { Stack } from '@aws-sdk/client-cloudformation';
import { QueueProcessor } from './lib/QueueProcessor';
import { Account } from '../shared/infra-account-library';
import { CloudFormationClientFactory } from '../shared/CloudFormationClientFactory';
import { Credentials } from '@aws-sdk/client-sts';

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
      accounts.forEach(async (account) => {
        const role = await this.accountManager.assumeRole(
          account.id,
          appVariables.ROLE_TO_ASSUME,
        );

        if (role.valid) {
          this.stackReports.push(
            await this.processStacks(account, 'eu-west2', role.credentials),
          );
        } else {
          console.warn(
            `Unable to assume role ${appVariables.ROLE_TO_ASSUME} for account ${account.name}:${account.id}`,
          );
        }
      });
    } finally {
      await this.emailProcessor.buildEmailAndSend(
        this.stackReports,
        new Date(),
      );
    }
  }

  protected async processStacks(
    account: Account,
    region: string,
    credentials: Credentials,
  ): Promise<IStackReport> {
    const stacks = await this.stackManager.getStacks(region, credentials);
    const stacksToProcess: Stack[] = [];
    const stacksNotToProcess: Stack[] = [];

    try {
      stacks.forEach((stack) => {
        try {
          if (
            this.hasTag(stack, appVariables.ENVIRONMENT_TO_PROCESS) &&
            !this.hasTag(stack, 'Retain') &&
            this.isOlderThanDays(
              stack,
              parseInt(appVariables.STALE_AFTER_DAYS, 10),
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
      });

      if (
        appVariables.DRY_RUN &&
        appVariables.DRY_RUN.toString().toLowerCase() !== 'true'
      ) {
        await this.sendToBeDeleted(
          account,
          stacksToProcess,
          region,
          credentials,
        );
      }
    } catch (error) {
      console.error(`Error occurred while processing stacks for account ${account.name}: ${JSON.stringify(error)}`);
    }

    return {
      accountName: account.name,
      accountNumber: account.id,
      stacksToDelete: stacksToProcess,
      stacksNotToDelete: stacksNotToProcess,
    };
  }

  protected async sendToBeDeleted(
    account: Account,
    stacks: Stack[],
    region: string,
    credentials: Credentials,
  ): Promise<void> {
    const orderedStacks = await this.stackManager.getDeletionOrder(
      stacks,
      region,
      credentials,
    );
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
