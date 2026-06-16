export type QueueMessage = {
  correlationId: string;
  batchId: string;
  accountId: string;
  accountName: string;
  region: string;
  stackName: string;
  deleteOrder: number;
  reason: string;
  lastTouched: string;
};
