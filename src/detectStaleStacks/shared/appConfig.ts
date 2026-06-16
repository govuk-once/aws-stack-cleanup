export const appVariables = {
  DRY_RUN: process.env.DRY_RUN!,
  ENVIRONMENT_TO_PROCESS: process.env.ENVIRONMENT_TO_PROCESS!,
  ROLE_TO_ASSUME: process.env.ROLE_TO_ASSUME!,
  STALE_AFTER_DAYS: process.env.STALE_AFTER_DAYS!,
  TOPIC_ARN: process.env.TOPIC_ARN!,
  TOPIC_NAME: process.env.TOPIC_NAME!,
  QUEUE_ARN: process.env.QUEUE_ARN!,
  QUEUE_NAME: process.env.QUEUE_NAME!,
  QUEUE_URL: process.env.QUEUE_URL!,
};
