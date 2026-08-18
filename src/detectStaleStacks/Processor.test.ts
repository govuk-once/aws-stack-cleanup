import { describe, expect, test, vi, beforeEach } from 'vitest';
import { Stack } from '@aws-sdk/client-cloudformation';

import { Processor } from './Processor';
import { IEmailProcessor } from './lib/interfaces/IEmailProcessor';
import { IStackManager } from './lib/interfaces/IStackManager';
import { IQueueProcessor } from './lib/interfaces/IQueueProcessor';

describe('Processor', () => {
  const testDate = new Date(2026, 6, 4);
  const updatedDate = new Date(2021, 1, 9);

  const oldStack: Stack = {
    StackName: 'old-dev-stack',
    StackStatus: 'CREATE_COMPLETE',
    CreationTime: updatedDate,
    LastUpdatedTime: updatedDate,
    Tags: [
      {
        Key: 'dev',
        Value: 'true',
      },
    ],
  };

  const retainedStack: Stack = {
    StackName: 'retained-stack',
    StackStatus: 'CREATE_COMPLETE',
    CreationTime: testDate,
    LastUpdatedTime: testDate,
    Tags: [
      {
        Key: 'dev',
        Value: 'true',
      },
      {
        Key: 'Retain',
        Value: 'true',
      },
    ],
  };

  const newStack: Stack = {
    StackName: 'new-dev-stack',
    StackStatus: 'CREATE_COMPLETE',
    CreationTime: testDate,
    LastUpdatedTime: testDate,
    Tags: [
      {
        Key: 'dev',
        Value: 'true',
      },
    ],
  };

  let emailProcessor: IEmailProcessor;
  let stackManager: IStackManager;
  let queueProcessor: IQueueProcessor;

  process.env.ENVIRONMENT_TO_PROCESS = 'dev';
  process.env.STALE_AFTER_DAYS = '60';
  process.env.DRY_RUN = 'false';

  beforeEach(() => {
    vi.clearAllMocks();

    emailProcessor = {
      buildEmailAndSend: vi.fn().mockResolvedValue(undefined),
    } as unknown as IEmailProcessor;

    stackManager = {
      getStacks: vi.fn().mockResolvedValue([oldStack, retainedStack, newStack]),
      getDeletionOrder: vi.fn().mockResolvedValue([
        {
          stackName: 'old-dev-stack',
          dependsOn: [],
          lastTouched: oldStack.LastUpdatedTime,
          status: oldStack.StackStatus,
        },
      ]),
    } as unknown as IStackManager;

    queueProcessor = {
      send: vi.fn().mockResolvedValue(undefined),
    } as unknown as IQueueProcessor;
  });

  test('builds and sends an email report', async () => {
    const processor = new Processor(
      emailProcessor,
      stackManager,
      queueProcessor,
    );

    await processor.Run();

    expect(emailProcessor.buildEmailAndSend).toHaveBeenCalledOnce();
  });

  test('splits stacks into stacks to delete and stacks not to delete', async () => {
    const processor = new Processor(
      emailProcessor,
      stackManager,
      queueProcessor,
    );

    await processor.Run();

    expect(emailProcessor.buildEmailAndSend).toHaveBeenCalledOnce();

    const [reports] = (
      emailProcessor.buildEmailAndSend as ReturnType<typeof vi.fn>
    ).mock.calls[0];

    expect(reports).toHaveLength(1);

    expect(reports[0].stacksToDelete).toHaveLength(1);
    expect(reports[0].stacksToDelete[0].StackName).toBe('old-dev-stack');

    expect(reports[0].stacksNotToDelete).toHaveLength(2);

    expect(
      reports[0].stacksNotToDelete.some(
        (stack: Stack) => stack.StackName === 'retained-stack',
      ),
    ).toBe(true);

    expect(
      reports[0].stacksNotToDelete.some(
        (stack: Stack) => stack.StackName === 'new-dev-stack',
      ),
    ).toBe(true);
  });

  test('sends stacks to queue when dry run is false', async () => {
    const processor = new Processor(
      emailProcessor,
      stackManager,
      queueProcessor,
    );

    await processor.Run();

    expect(queueProcessor.send).toHaveBeenCalled();
  });

  test('does not send stacks to queue when dry run is true', async () => {
    process.env.DRY_RUN = 'true';

    const processor = new Processor(
      emailProcessor,
      stackManager,
      queueProcessor,
    );

    await processor.Run();

    expect(queueProcessor.send).not.toHaveBeenCalled();
  });
});
