import { Stack } from '@aws-sdk/client-cloudformation';

export interface IStackReport {
  stacksToDelete: Stack[];
  stacksNotToDelete: Stack[];
}
