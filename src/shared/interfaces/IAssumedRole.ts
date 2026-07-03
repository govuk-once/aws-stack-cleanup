import { Credentials } from '@aws-sdk/client-sts';

export interface IAssumedRole {
  credentials: Credentials;
  error: Error;
  valid: boolean;
}
