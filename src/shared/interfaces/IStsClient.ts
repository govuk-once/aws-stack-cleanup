import { Credentials, AssumeRoleCommand } from '@aws-sdk/client-sts';

interface response {
  Credentials: Credentials;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $metadata?: any;
}

export interface IStsClient {
  send(command: AssumeRoleCommand): Promise<response>;
}
