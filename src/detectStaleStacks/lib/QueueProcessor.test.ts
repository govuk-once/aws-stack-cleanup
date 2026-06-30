import { describe, test, expect, vi } from 'vitest';

import { MockSQSClient } from '../../testHelpers/mockSQSClient';
import { QueueProcessor } from './QueueProcessor';
import { QueueMessage } from '../../shared/queueMessage';

describe('Queue Processor tests', () => {
  test('Should be publish to a queue', async () => {
    const mockQSQClient = new MockSQSClient();

    const processor = new QueueProcessor(mockQSQClient);

    const message: QueueMessage = {
      correlationId: 'g',
      batchId: '1',
      accountId: 'account2',
      accountName: 'rabbit singers',
      region: 'eu-west2',
      stackName: 'Apple pie',
      deleteOrder: 1,
      reason: 'It very old',
      lastTouched: new Date().toISOString(),
    };

    processor.send(message);

    expect(mockQSQClient.getCallCount()).toBe(1);
  });
});
