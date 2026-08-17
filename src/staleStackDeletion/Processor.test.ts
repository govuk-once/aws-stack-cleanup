import { DeleteStackCommand } from '@aws-sdk/client-cloudformation';
import { describe, expect, vi, test, beforeEach } from 'vitest';

import { Processor } from './Processor';
import type { QueueMessage } from '../shared/queueMessage';
import type { ICloudFormationClientFactory } from '../shared/interfaces/ICloudFormationClientFactory';

describe('Processor', () => {
  const message: QueueMessage = {
    correlationId: 'correlation-1',
    batchId: 'batch-1',
    region: 'eu-west-2',
    stackName: 'test-stack',
    deleteOrder: 1,
    reason: 'stale stack',
    lastTouched: '2026-01-01T00:00:00.000Z',
  };

  let sendMock: ReturnType<typeof vi.fn>;
  let cloudFormationClientFactory: ICloudFormationClientFactory;

  beforeEach(() => {
    vi.clearAllMocks();

    sendMock = vi.fn().mockResolvedValue({});

    cloudFormationClientFactory = {
      getClient: vi.fn().mockReturnValue({
        send: sendMock,
      }),
    } as unknown as ICloudFormationClientFactory;
  });

  test('deletes the stack without assuming a role', async () => {
    const processor = new Processor(cloudFormationClientFactory);

    await processor.run(message);

    expect(cloudFormationClientFactory.getClient).toHaveBeenCalledWith(
      'eu-west-2',
    );

    expect(sendMock).toHaveBeenCalledTimes(1);

    const command = sendMock.mock.calls[0][0] as DeleteStackCommand;

    expect(command).toBeInstanceOf(DeleteStackCommand);
    expect(command.input).toEqual({
      StackName: 'test-stack',
    });
  });

  test('deleteStack creates a CloudFormation client and sends DeleteStackCommand', async () => {
    const processor = new Processor(cloudFormationClientFactory);

    await processor.deleteStack(message);

    expect(cloudFormationClientFactory.getClient).toHaveBeenCalledWith(
      'eu-west-2',
    );

    expect(sendMock).toHaveBeenCalledTimes(1);

    const command = sendMock.mock.calls[0][0] as DeleteStackCommand;

    expect(command.input.StackName).toBe('test-stack');
  });
});
