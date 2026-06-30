import { describe, expect, test, vi, beforeEach } from 'vitest';
import type { Stack } from '@aws-sdk/client-cloudformation';

import { Processor } from './Processor';
import type { IAccountManager } from './lib/interfaces/IAccountManager';
import type { IEmailProcessor } from './lib/interfaces/IEmailProcessor';
import type { IStackManager } from './lib/interfaces/IStackManager';
import type { IQueueProcessor } from './lib/interfaces/IQueueProcessor';
import type { Account } from './lib/infra-account-library';
import { AccountName } from './lib/infra-account-library/models/accounts/AccountName';
import { EnvLabel } from './lib/infra-account-library/models/EnvLabel';

class TestProcessor extends Processor {
  public async testProcessStacks(account: Account) {
    return this.processStacks(account);
  }
}

describe('Processor', () => {
  const testDate = new Date(2026, 6, 4);
  const updatedDate = new Date(2021, 1, 9);
  const account: Account = {
    id: '123456789012',
    displayName: 'fred',
    name: AccountName.govukAppCompanionDevelopment,
    envLabel: EnvLabel.dev,
  };

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

  let accountManager: IAccountManager;
  let emailProcessor: IEmailProcessor;
  let stackManager: IStackManager;
  let queueProcessor: IQueueProcessor;

  process.env.ENVIRONMENT_TO_PROCESS = 'dev';
  process.env.STALE_AFTER_DAYS = '60';

  beforeEach(() => {
    vi.clearAllMocks();

    accountManager = {
      getDevelopmentAccounts: vi.fn().mockReturnValue([account]),
      assumeRole: vi.fn().mockResolvedValue({
        valid: true,
      }),
    } as unknown as IAccountManager;

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
      accountManager,
      emailProcessor,
      stackManager,
      queueProcessor,
    );

    await processor.Run();

    expect(accountManager.getDevelopmentAccounts).toHaveBeenCalledOnce();

    expect(emailProcessor.buildEmailAndSend).toHaveBeenCalledOnce();
  });

  test('splits stacks into stacks to delete and stacks not to delete', async () => {
    const processor = new TestProcessor(
      accountManager,
      emailProcessor,
      stackManager,
      queueProcessor,
    );

    const report = await processor.testProcessStacks(account);

    expect(report.accountName).toBe('govuk-app-companion-development');
    expect(report.accountNumber).toBe('123456789012');

    expect(report.stacksToDelete).toHaveLength(1);
    expect(report.stacksToDelete[0].StackName).toBe('old-dev-stack');

    expect(report.stacksNotToDelete).toHaveLength(2);

    expect(
      report.stacksNotToDelete.some(
        (stack) => stack.StackName === 'retained-stack',
      ),
    ).toBe(true);

    expect(
      report.stacksNotToDelete.some(
        (stack) => stack.StackName === 'new-dev-stack',
      ),
    ).toBe(true);
  });

  test('does not send stacks to queue when dry run is true', async () => {
    const processor = new TestProcessor(
      accountManager,
      emailProcessor,
      stackManager,
      queueProcessor,
    );

    await processor.testProcessStacks(account);

    expect(queueProcessor.send).not.toHaveBeenCalled();
  });
});
