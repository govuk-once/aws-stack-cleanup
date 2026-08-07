import { ICloudFormationClient } from '../shared/interfaces/ICloudFormationClient';
import { ICloudFormationClientFactory } from '../shared/interfaces/ICloudFormationClientFactory';
import { MockCloudFormationClient } from './mockCloudFormationClient';

export class MockCloudFormationClientFactory implements ICloudFormationClientFactory {
  public getClient(): ICloudFormationClient {
    return new MockCloudFormationClient();
  }
}
