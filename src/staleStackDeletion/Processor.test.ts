import { DeleteStackCommand } from '@aws-sdk/client-cloudformation';
import type { Credentials } from '@aws-sdk/client-sts';
import { describe, expect, vi, test, beforeEach } from 'vitest';

import { Processor } from './Processor';
import type { QueueMessage } from '../shared/queueMessage';
import type { IAccountManager } from '../shared/interfaces/IAccountManager';
import type { ICloudFormationClientFactory } from '../shared/interfaces/ICloudFormationClientFactory';

describe('Processor', () => {
  const credentials: Credentials = {
    AccessKeyId: 'test-access-key',
    SecretAccessKey: 'test-secret-key',
    SessionToken: 'test-session-token',
    Expiration: new Date('2030-01-01T00:00:00Z'),
  };

  const message: QueueMessage = {
    correlationId: 'correlation-1',
    batchId: 'batch-1',
    accountId: '123456789012',
    accountName: 'development',
    region: 'eu-west-2',
    stackName: 'test-stack',
    deleteOrder: 1,
    reason: 'stale stack',
    lastTouched: '2026-01-01T00:00:00.000Z',
  };

  let sendMock: ReturnType<typeof vi.fn>;
  let accountManager: IAccountManager;
  let cloudFormationClientFactory: ICloudFormationClientFactory;

  beforeEach(() => {
    vi.clearAllMocks();

    sendMock = vi.fn().mockResolvedValue({});

    accountManager = {
      assumeRole: vi.fn().mockResolvedValue({
        valid: true,
        credentials,
      }),
    } as unknown as IAccountManager;

    cloudFormationClientFactory = {
      getClient: vi.fn().mockReturnValue({
        send: sendMock,
      }),
    } as unknown as ICloudFormationClientFactory;
  });

  test('assumes the role for the target account and deletes the stack', async () => {
    const processor = new Processor(
      accountManager,
      cloudFormationClientFactory,
    );

    await processor.run(message);

    expect(accountManager.assumeRole).toHaveBeenCalledWith(
      '123456789012',
      expect.any(String),
    );

    expect(cloudFormationClientFactory.getClient).toHaveBeenCalledWith(
      'eu-west-2',
      credentials,
    );

    expect(sendMock).toHaveBeenCalledTimes(1);

    const command = sendMock.mock.calls[0][0] as DeleteStackCommand;

    expect(command).toBeInstanceOf(DeleteStackCommand);
    expect(command.input).toEqual({
      StackName: 'test-stack',
    });
  });

  test('deleteStack creates a CloudFormation client and sends DeleteStackCommand', async () => {
    const processor = new Processor(
      accountManager,
      cloudFormationClientFactory,
    );

    await processor.deleteStack(message, credentials);

    expect(cloudFormationClientFactory.getClient).toHaveBeenCalledWith(
      'eu-west-2',
      credentials,
    );

    expect(sendMock).toHaveBeenCalledTimes(1);

    const command = sendMock.mock.calls[0][0] as DeleteStackCommand;

    expect(command.input.StackName).toBe('test-stack');
  });
});
