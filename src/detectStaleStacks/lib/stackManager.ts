import {
  DescribeStacksCommand,
  ListExportsCommand,
  ListExportsCommandOutput,
  ListImportsCommand,
  ListImportsCommandOutput,
  DescribeStacksCommandOutput,
  Stack,
  CloudFormationClient,
} from '@aws-sdk/client-cloudformation';

import { ICloudFormationClientFactory } from '../../shared/interfaces/ICloudFormationClientFactory';
import { CloudFormationClientFactory } from '../../shared/CloudFormationClientFactory';
import { IStackManager } from './interfaces/IStackManager';
import { IStackDependency } from './interfaces/IStackDependency';

export class StackManager implements IStackManager {
  constructor(
    protected cloudFormationClientFactory: ICloudFormationClientFactory = new CloudFormationClientFactory(),
  ) {}

  public async getStacks(
    region: string,
  ): Promise<Stack[]> {
    const stacks: Stack[] = [];
    let nextToken: string | undefined;

    const client = this.cloudFormationClientFactory.getClient(region);
    do {
      const response = (await client.send(
        new DescribeStacksCommand({
          NextToken: nextToken,
        }),
      )) as DescribeStacksCommandOutput;

      stacks.push(...(response.Stacks ?? []));
      nextToken = response.NextToken;
    } while (nextToken);

    return stacks;
  }

  public async getDeletionOrder(
    stacks: Stack[],
    region: string,
  ): Promise<IStackDependency[]> {
    const activeStacks = stacks.filter(
      (stack) =>
        stack.StackName &&
        !['DELETE_COMPLETE', 'DELETE_IN_PROGRESS'].includes(
          stack.StackStatus ?? '',
        ),
    );

    const dependencyMap = new Map<string, Set<string>>();

    for (const stack of activeStacks) {
      dependencyMap.set(stack.StackName!, new Set());
    }

    await this.addExportImportDependencies(dependencyMap, region);

    return this.orderForDeletion(dependencyMap);
  }

  protected async addExportImportDependencies(
    dependencyMap: Map<string, Set<string>>,
    region: string,
  ): Promise<void> {
    let nextToken: string | undefined;

    const client = this.cloudFormationClientFactory.getClient(region);
    do {
      const response = (await client.send(
        new ListExportsCommand({
          NextToken: nextToken,
        }),
      )) as ListExportsCommandOutput;

      for (const exportValue of response.Exports ?? []) {
        if (!exportValue.Name || !exportValue.ExportingStackId) {
          continue;
        }

        const exportingStackName = this.getNameFromArn(
          exportValue.ExportingStackId,
        );

        const importResponse = (await client.send(
          new ListImportsCommand({
            ExportName: exportValue.Name,
          }),
        )) as ListImportsCommandOutput;

        for (const importingStackName of importResponse.Imports ?? []) {
          if (
            dependencyMap.has(importingStackName) &&
            dependencyMap.has(exportingStackName)
          ) {
            dependencyMap.get(importingStackName)!.add(exportingStackName);
          }
        }
        nextToken = importResponse.NextToken;
      }
    } while (nextToken);
  }

  protected getNameFromArn(stackArn: string): string {
    const items = stackArn.split('/');

    if (items.length < 2) {
      throw new Error(
        `Unable to parse stack arn to obtain stack name from ${stackArn}`,
      );
    }
    return items[1];
  }

  protected async orderForDeletion(
    dependencyMap: Map<string, Set<string>>,
  ): Promise<IStackDependency[]> {
    const result: IStackDependency[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (stackName: string): void => {
      if (visited.has(stackName)) {
        return;
      }

      if (visiting.has(stackName)) {
        throw new Error(`Found circular dependancy with stack ${stackName}`);
      }
      visiting.add(stackName);

      const dependenices = dependencyMap.get(stackName) ?? new Set<string>();

      for (const dependency of dependenices) {
        visit(dependency);
      }

      visiting.delete(stackName);
      visited.add(stackName);
      result.push({
        stackName,
        dependsOn: Array.from(dependenices),
      });
    };

    for (const stackName of dependencyMap.keys()) {
      visit(stackName);
    }

    return result.reverse();
  }
}
