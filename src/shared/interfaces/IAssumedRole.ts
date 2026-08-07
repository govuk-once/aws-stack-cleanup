import { Credentials } from '@aws-sdk/client-sts';

export interface IAssumedRole {
  credentials: Credentials | undefined;
  error: number | undefined;
  valid: boolean;
}
