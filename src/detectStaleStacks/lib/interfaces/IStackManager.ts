import { Stack } from '@aws-sdk/client-cloudformation';
import { IStackDependency } from './IStackDependency';

export interface IStackManager {
  getStacks(region: string): Promise<Stack[]>;
  getDeletionOrder(
    stacks: Stack[],
    region: string,
  ): Promise<IStackDependency[]>;
}
