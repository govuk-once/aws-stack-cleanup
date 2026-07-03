import { describe, test, expect, vi } from 'vitest';
import { Credentials } from '@aws-sdk/client-sts';

import { MockCloudFormationClient } from '../../testHelpers/mockCloudFormationClient';
import { MockCloudFormationClientFactory } from '../../testHelpers/mockCloudFormationClientFactory';
import { StackManager } from './stackManager';

describe('Stack Manager tests', () => {
  const credentials: Credentials = {
    AccessKeyId: '',
    SecretAccessKey: '',
    SessionToken: '',
    Expiration: new Date(),
  };
  test('Should list all active stacks', async () => {
    const manager = new StackManager(new MockCloudFormationClientFactory());

    const stacks = await manager.getStacks('', credentials);

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

    const stacks = await manager.getStacks('', credentials);

    const deletionOrder = await manager.getDeletionOrder(
      stacks,
      '',
      credentials,
    );

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
