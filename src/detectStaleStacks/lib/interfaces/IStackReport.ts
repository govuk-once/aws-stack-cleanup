import { Stack } from '@aws-sdk/client-cloudformation';

export interface IStackReport {
  accountName: string;
  accountNumber: string;
  stacksToDelete: Stack[];
  stacksNotToDelete: Stack[];
}
