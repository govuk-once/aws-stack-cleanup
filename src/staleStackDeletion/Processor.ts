import { appVariables } from '../shared/appConfig';
import { AccountManager } from '../shared/accountManager';
import { QueueMessage } from '../shared/queueMessage';
import { IAccountManager } from '../shared/interfaces/IAccountManager';
import { ICloudFormationClient } from '../shared/interfaces/ICloudFormationClient';
import {
  CloudFormationClient,
  DeleteStackCommand,
} from '@aws-sdk/client-cloudformation';
import { STSClient } from '@aws-sdk/client-sts';
import { Credentials } from '@aws-sdk/client-sts';
import { ICloudFormationClientFactory } from '../shared/interfaces/ICloudFormationClientFactory';
import { CloudFormationClientFactory } from '../shared/CloudFormationClientFactory';

export class Processor {
  constructor(
    protected accountManager: IAccountManager = new AccountManager(
      new STSClient(),
    ),
    protected cloudFormationClientFactory: ICloudFormationClientFactory = new CloudFormationClientFactory(),
  ) {}

  public async run(message: QueueMessage): Promise<void> {
    try {
      const credentials = await this.accountManager.assumeRole(
        message.accountId,
        appVariables.ROLE_TO_ASSUME,
      );
      await this.deleteStack(message, credentials.credentials);
    } catch (error) {
      console.error(`Unable to assume role`);
    }
  }

  public async deleteStack(
    message: QueueMessage,
    credentials: Credentials,
  ): Promise<void> {
    console.info(
      `Sending command to delete stack:${message.stackName} from account:${message.accountId}-${message.accountName}`,
    );

    const client = this.cloudFormationClientFactory.getClient(
      message.region,
      credentials,
    );

    await client.send(
      new DeleteStackCommand({
        StackName: message.stackName,
      }),
    );
  }
}
