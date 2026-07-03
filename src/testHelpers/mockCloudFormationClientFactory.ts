import { Credentials } from '@aws-sdk/client-sts';
import { ICloudFormationClient } from '../shared/interfaces/ICloudFormationClient';
import { ICloudFormationClientFactory } from '../shared/interfaces/ICloudFormationClientFactory';
import { MockCloudFormationClient } from './mockCloudFormationClient';

export class MockCloudFormationClientFactory implements ICloudFormationClientFactory {
  public getClient(
    region: string,
    credentials: Credentials,
  ): ICloudFormationClient {
    return new MockCloudFormationClient();
  }
}
