import { Credentials, AssumeRoleCommand } from '@aws-sdk/client-sts';

export interface IStsClient {
  send(command: AssumeRoleCommand): Promise<Credentials>;
}
