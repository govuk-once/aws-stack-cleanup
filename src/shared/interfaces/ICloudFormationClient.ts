import {
  CloudFormationClient,
  DescribeStackEventsCommand,
  DescribeStacksCommand,
  ListExportsCommand,
  ListImportsCommand,
  DescribeStacksCommandOutput,
  ListExportsCommandOutput,
  ListImportsCommandOutput,
} from '@aws-sdk/client-cloudformation';

export interface ICloudFormationClient {
  send(
    command: DescribeStacksCommand | ListExportsCommand | ListImportsCommand,
  ): Promise<unknown>;
}
