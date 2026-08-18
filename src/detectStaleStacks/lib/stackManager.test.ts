import { describe, test, expect } from 'vitest';

import { MockCloudFormationClientFactory } from '../../testHelpers/mockCloudFormationClientFactory';
import { StackManager } from './stackManager';

describe('Stack Manager tests', () => {
  test('Should list all active stacks', async () => {
    const manager = new StackManager(new MockCloudFormationClientFactory());

    const stacks = await manager.getStacks('eu-west-2');

    expect(stacks).toHaveLength(3);
    expect(stacks.some((stack) => stack.StackName === 'DatabaseStack')).toBe(
      true,
    );
    expect(stacks.some((stack) => stack.StackName === 'ApiStack')).toBe(true);
    expect(stacks.some((stack) => stack.StackName === 'WorkerStack')).toBe(
      true,
    );
  });

  test('Should place be able to list stack in deletion order', async () => {
    const manager = new StackManager(new MockCloudFormationClientFactory());

    const stacks = await manager.getStacks('eu-west-2');

    const deletionOrder = await manager.getDeletionOrder(stacks, 'eu-west-2');

    const apiStack = deletionOrder.find(
      (item) => item.stackName === 'ApiStack',
    );

    expect(apiStack).toBeDefined();

    expect(apiStack?.dependsOn).toContain('DatabaseStack');
    const workerStack = deletionOrder.find(
      (item) => item.stackName === 'WorkerStack',
    );

    expect(workerStack).toBeDefined();
    expect(workerStack?.dependsOn).toContain('DatabaseStack');
  });
});
