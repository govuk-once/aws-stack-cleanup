import { describe, test, expect, vi } from 'vitest';

import { MockSNSClient } from '../../testHelpers/mockSnsClient';
import { expectedEmail } from '../../testHelpers/emailResult';
import { EmailProcessor } from './EmailProcessor';
import { IStackReport } from './interfaces/IStackReport';
import { StackStatus } from '@aws-sdk/client-cloudformation';

describe('Stack Manager tests', () => {
  test('Should be able to build an email', async () => {
    const stackRport: IStackReport[] = [];
    const reportDate = new Date(2026, 6, 30);
    const testDate1 = new Date(2026, 1, 1);
    const testDate2 = new Date(2022, 1, 1);

    const stackReport1: IStackReport = {
      accountName: 'Account1',
      accountNumber: '1',
      stacksToDelete: [
        {
          StackName: 'delete me stack',
          CreationTime: testDate1,
          StackStatus: StackStatus.CREATE_COMPLETE,
        },
        {
          StackName: 'retry me delete me stack account 1',
          CreationTime: testDate1,
          StackStatus: StackStatus.DELETE_FAILED,
        },
      ],
      stacksNotToDelete: [
        {
          StackName: ' DO NOT delete me old stack',
          CreationTime: testDate2,
          StackStatus: StackStatus.CREATE_COMPLETE,
        },
        {
          StackName: 'DO NOT delete me old stack2 account 1',
          CreationTime: testDate2,
          StackStatus: StackStatus.DELETE_FAILED,
        },
      ],
    };

    const stackReport2: IStackReport = {
      accountName: 'Account2',
      accountNumber: '2',
      stacksToDelete: [
        {
          StackName: 'DELETE me stack account 2',
          CreationTime: testDate1,
          StackStatus: StackStatus.CREATE_COMPLETE,
        },
        {
          StackName: 'retry me DELETE me stack account 2',
          CreationTime: testDate1,
          StackStatus: StackStatus.DELETE_FAILED,
        },
      ],
      stacksNotToDelete: [
        {
          StackName: 'DO NOT DELETE me old stack account 2',
          CreationTime: testDate1,
          StackStatus: StackStatus.CREATE_COMPLETE,
        },
        {
          StackName: 'Do NOT DELETE me old stack2 account2',
          CreationTime: testDate2,
          StackStatus: StackStatus.DELETE_FAILED,
        },
      ],
    };

    stackRport.push(stackReport1);
    stackRport.push(stackReport2);

    const emailProcessor = new EmailProcessor(new MockSNSClient());

    const html = emailProcessor.buildEmail(stackRport, reportDate);

    expect(html).toBeDefined();
    expect(html).toBe(expectedEmail);
  });

  test('Should be able to send an email', async () => {
    const stackRport: IStackReport[] = [];
    const reportDate = new Date(2026, 6, 30);
    const testDate1 = new Date(2026, 1, 1);
    const testDate2 = new Date(2022, 1, 1);

    const stackReport1: IStackReport = {
      accountName: 'Account1',
      accountNumber: '1',
      stacksToDelete: [
        {
          StackName: 'delete me stack',
          CreationTime: testDate1,
          StackStatus: StackStatus.CREATE_COMPLETE,
        },
        {
          StackName: 'retry me delete me stack account 1',
          CreationTime: testDate1,
          StackStatus: StackStatus.DELETE_FAILED,
        },
      ],
      stacksNotToDelete: [
        {
          StackName: ' DO NOT delete me old stack',
          CreationTime: testDate2,
          StackStatus: StackStatus.CREATE_COMPLETE,
        },
        {
          StackName: 'DO NOT delete me old stack2 account 1',
          CreationTime: testDate2,
          StackStatus: StackStatus.DELETE_FAILED,
        },
      ],
    };

    const stackReport2: IStackReport = {
      accountName: 'Account2',
      accountNumber: '2',
      stacksToDelete: [
        {
          StackName: 'DELETE me stack account 2',
          CreationTime: testDate1,
          StackStatus: StackStatus.CREATE_COMPLETE,
        },
        {
          StackName: 'retry me DELETE me stack account 2',
          CreationTime: testDate1,
          StackStatus: StackStatus.DELETE_FAILED,
        },
      ],
      stacksNotToDelete: [
        {
          StackName: 'DO NOT DELETE me old stack account 2',
          CreationTime: testDate1,
          StackStatus: StackStatus.CREATE_COMPLETE,
        },
        {
          StackName: 'Do NOT DELETE me old stack2 account2',
          CreationTime: testDate2,
          StackStatus: StackStatus.DELETE_FAILED,
        },
      ],
    };

    stackRport.push(stackReport1);
    stackRport.push(stackReport2);

    const mockClient = new MockSNSClient();
    const emailProcessor = new EmailProcessor(mockClient);

    const html = await emailProcessor.buildEmailAndSend(stackRport, reportDate);

    expect(mockClient.getCallCount()).toBe(1);
    expect(html).toBeDefined();
    expect(html).toBe(expectedEmail);
  });
});
