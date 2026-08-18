export const appVariables = {
  DRY_RUN: process.env.DRY_RUN ?? true,
  ENVIRONMENT_TO_PROCESS: process.env.ENVIRONMENT_TO_PROCESS ?? 'dev',
  STALE_AFTER_DAYS: process.env.STALE_AFTER_DAYS ?? '60',
  TOPIC_ARN: process.env.TOPIC_ARN!,
  TOPIC_NAME: process.env.TOPIC_NAME!,
  QUEUE_ARN: process.env.QUEUE_ARN!,
  QUEUE_NAME: process.env.QUEUE_NAME!,
  QUEUE_URL: process.env.QUEUE_URL!,
};
