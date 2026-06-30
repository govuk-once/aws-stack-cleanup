import { SendMessageCommand } from '@aws-sdk/client-sqs';

import { ISQSClient } from '../detectStaleStacks/lib/interfaces/ISQSClient';

export class MockSQSClient implements ISQSClient {
  protected callCount: number = 0;

  public async send(command: SendMessageCommand): Promise<void> {
    if (command instanceof SendMessageCommand) {
      this.callCount++;
    }
  }

  public getCallCount() {
    return this.callCount;
  }
}
