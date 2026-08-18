import { Credentials } from '@aws-sdk/client-sts';
import { ICloudFormationClient } from './ICloudFormationClient';

export interface ICloudFormationClientFactory {
  getClient(region: string, credentials?: Credentials): ICloudFormationClient;
}
