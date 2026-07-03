import { appVariables } from '../shared/appConfig';
import { AccountManager } from '../shared/accountManager';
import { QueueMessage } from '../shared/queueMessage';
import { IStsClient } from '../shared/interfaces/IStsClient';
import { IAccountManager } from '../shared/interfaces/IAccountManager';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';

export class Processor {
  constructor(
    protected accountManager: IAccountManager = new AccountManager(
      new STSClient(),
    ),
  ) {}

  public async run(message: QueueMessage): Promise<void> {
    await this.accountManager.assumeRole(
      message.accountId,
      appVariables.ROLE_TO_ASSUME,
    );
  }
}
