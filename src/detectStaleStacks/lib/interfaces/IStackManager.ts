import { Stack } from '@aws-sdk/client-cloudformation';
import { Credentials } from '@aws-sdk/client-sts';
import { IStackDependency } from './IStackDependency';

export interface IStackManager {
  getStacks(region: string, credentials: Credentials): Promise<Stack[]>;
  getDeletionOrder(stacks: Stack[]): Promise<IStackDependency[]>;
}
