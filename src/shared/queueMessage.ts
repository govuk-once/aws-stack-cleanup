export type QueueMessage = {
  correlationId: string;
  batchId: string;
  region: string;
  stackName: string;
  deleteOrder: number;
  reason: string;
  lastTouched: string;
};
