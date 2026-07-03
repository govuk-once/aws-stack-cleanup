import {
  CloudFormationClient,
  DescribeStackEventsCommand,
  DescribeStacksCommand,
  ListExportsCommand,
  ListImportsCommand,
  DescribeStacksCommandOutput,
  ListExportsCommandOutput,
  ListImportsCommandOutput,
  StackStatus,
} from '@aws-sdk/client-cloudformation';

import { ICloudFormationClient } from '../shared/interfaces/ICloudFormationClient';

export class MockCloudFormationClient implements ICloudFormationClient {
  public async send(command: unknown): Promise<unknown> {
    if (command instanceof DescribeStacksCommand) {
      return {
        Stacks: [
          {
            StackName: 'DatabaseStack',
            StackStatus: StackStatus.CREATE_COMPLETE,
          },
          {
            StackName: 'ApiStack',
            StackStatus: StackStatus.CREATE_COMPLETE,
          },
          {
            StackName: 'WorkerStack',
            StackStatus: StackStatus.CREATE_COMPLETE,
          },
        ],
      };
    }

    if (command instanceof ListExportsCommand) {
      return {
        Exports: [
          {
            Name: 'DatabaseStack:TableArn',
            ExportingStackId:
              'arn:aws:cloudformation:eu-west-2:123456789012:stack/DatabaseStack/abc',
          },
          {
            Name: 'ApiStack:ApiUrl',
            ExportingStackId:
              'arn:aws:cloudformation:eu-west-2:123456789012:stack/ApiStack/abc',
          },
        ],
      };
    }

    if (command instanceof ListImportsCommand) {
      const exportName = command.input.ExportName;

      if (exportName === 'DatabaseStack:TableArn') {
        return {
          Imports: ['ApiStack', 'WorkerStack'],
        };
      }

      if (exportName === 'ApiStack:ApiUrl') {
        return {
          Imports: [],
        };
      }

      return {
        Imports: [],
      };
    }

    throw new Error('Unexpected command');
  }
}
