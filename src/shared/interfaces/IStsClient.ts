import { Credentials, AssumeRoleCommand } from '@aws-sdk/client-sts';

interface response {
  Credentials: Credentials;
  $metadata?: any;
}

export interface IStsClient {
  send(command: AssumeRoleCommand): Promise<response>;
}
