import { appVariables } from '../shared/appConfig';
import { AccountManager } from '../shared/accountManager';
import { QueueMessage } from '../shared/queueMessage';
import { IAccountManager } from '../shared/interfaces/IAccountManager';
import { DeleteStackCommand } from '@aws-sdk/client-cloudformation';
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
    const role = await this.accountManager.assumeRole(
      message.accountId,
      appVariables.ROLE_TO_ASSUME,
    );

    if (!role.valid) {
      throw new Error(
        `Unable to assume role ${appVariables.ROLE_TO_ASSUME} for account:${message.accountId} ${message.accountName}`,
      );
    }

    try {
      await this.deleteStack(message, role.credentials);
    } catch (error) {
      console.error(
        `Unable to delete stack ${message.stackName} in account:${message.accountId} ${message.accountName} due to ${JSON.stringify(error)}`,
      );
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
