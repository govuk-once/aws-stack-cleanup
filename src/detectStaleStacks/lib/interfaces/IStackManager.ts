import { Stack } from '@aws-sdk/client-cloudformation';
import { IStackDependency } from './IStackDependency';

export interface IStackManager {
  getStacks(): Promise<Stack[]>;
  getDeletionOrder(stacks: Stack[]): Promise<IStackDependency[]>;
}
