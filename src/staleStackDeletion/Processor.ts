import { QueueMessage } from '../shared/queueMessage';
import { DeleteStackCommand } from '@aws-sdk/client-cloudformation';
import { ICloudFormationClientFactory } from '../shared/interfaces/ICloudFormationClientFactory';
import { CloudFormationClientFactory } from '../shared/CloudFormationClientFactory';

export class Processor {
  constructor(
    protected cloudFormationClientFactory: ICloudFormationClientFactory = new CloudFormationClientFactory(),
  ) {}

  public async run(message: QueueMessage): Promise<void> {
    try {
      await this.deleteStack(message);
    } catch (error) {
      console.error(
        `Unable to delete stack ${message.stackName} in account:${message.accountId} ${message.accountName} due to ${JSON.stringify(error)}`,
      );
    }
  }

  public async deleteStack(message: QueueMessage): Promise<void> {
    console.info(
      `Sending command to delete stack:${message.stackName} from account:${message.accountId}-${message.accountName}`,
    );

    const client = this.cloudFormationClientFactory.getClient(message.region);

    await client.send(
      new DeleteStackCommand({
        StackName: message.stackName,
      }),
    );
  }
}
