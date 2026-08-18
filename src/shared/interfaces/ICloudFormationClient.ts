import {
  DeleteStackCommand,
  DescribeStacksCommand,
  ListExportsCommand,
  ListImportsCommand,
} from '@aws-sdk/client-cloudformation';

export interface ICloudFormationClient {
  send(
    command:
      | DescribeStacksCommand
      | DeleteStackCommand
      | ListExportsCommand
      | ListImportsCommand,
  ): Promise<unknown>;
}
