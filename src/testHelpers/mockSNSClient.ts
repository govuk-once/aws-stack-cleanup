import { PublishCommand } from '@aws-sdk/client-sns';

import { ISNSClient } from '../detectStaleStacks/lib/interfaces/ISNSClient';

export class MockSNSClient implements ISNSClient {
  protected callCount: number = 0;

  public async send(command: PublishCommand): Promise<void> {
    if (command instanceof PublishCommand) {
      this.callCount++;
    }
  }

  public getCallCount() {
    return this.callCount;
  }
}
