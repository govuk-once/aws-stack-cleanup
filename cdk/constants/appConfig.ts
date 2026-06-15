import { Environment } from 'aws-cdk-lib/aws-appconfig';
import * as logs from 'aws-cdk-lib/aws-logs';

export const appConfig = {
  DryRun: 'true',
  lambdaMaxDuration: 10,
  logRetentionDuration: logs.RetentionDays.FOUR_MONTHS,
  cleanupRole: 'stackCleanupRole',
  staleAfterDays: '60',
  environmentToProcess: 'dev',

  runTimeHour: 0,
  runTimeMinute: 10,

  notificationEmails: ['phill.armstrong@digital.cabinet-office.gov.uk'],

  queueName: 'StackCleanup',
  batchSize: 1,
  maxBatchingWindow: 1,
  retentionPeriod: 1,
  visibiltyTimeoutSeconds: 3600,
};

export const appVariables = {
  DRY_RUN: 'DRY_RUN',
  ENVIRONMENT_TO_PROCESS: 'ENVIRONMENT_TO_PROCESS',
  ROLE_TO_ASSUME: 'ROLE_TO_ASSUME',
  STALE_AFTER_DAYS: 'STALE_AFTER_DAYS',
  TOPIC_ARN: 'TOPIC_ARN',
  TOPIC_NAME: 'TOPIC_NAME',
  QUEUE_ARN: 'QUEUE_ARN',
  QUEUE_NAME: 'QUEUE_NAME',
  QUEUE_URL: 'QUEUE_URL',
};
