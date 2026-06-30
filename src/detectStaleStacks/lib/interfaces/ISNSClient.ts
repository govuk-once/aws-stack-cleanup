import { PublishCommand } from '@aws-sdk/client-sns';

export interface ISNSClient {
  send(command: PublishCommand): Promise<void>;
}
