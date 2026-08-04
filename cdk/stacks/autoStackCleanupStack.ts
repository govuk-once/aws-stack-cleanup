import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { isEphemeralEnvironment } from '../constants/environment';
import { appConfig, appVariables } from '../constants/appConfig';

import { INamingProvider } from 'once-platform-constructs/namingProviders';
import { ServiceEnvironmentNamingProvider } from 'once-platform-constructs/namingProviders';
import { LambdaFactory } from '../cdk_constructs/LambdaFactory';
import { RoleHelper, Operations } from '../cdk_constructs/RoleHelper';
import { KmsKeyFactory } from '../cdk_constructs/KmsKeyFactory';
import { SnsProviderFactory } from '../cdk_constructs/SnsProviderFactory';

import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(import.meta.url);

interface GovUkOnceStackProps extends cdk.StackProps {
  serviceName: string;
  teamName: string;
  repositoryUrl: string;
  version: string;
  environment: string;
  costCenter: string;
}

export class AutoStackCleanupStack extends cdk.Stack {
  private readonly namingProvider;

  constructor(
    scope: Construct,
    id: string,
    props: GovUkOnceStackProps,
    namingProvider?: INamingProvider,
  ) {
    super(scope, id, props);

    this.namingProvider =
      namingProvider ?? new ServiceEnvironmentNamingProvider(props.serviceName);

    // Add standard tags to all resources in the stack
    cdk.Tags.of(this).add('ServiceName', props.serviceName);
    cdk.Tags.of(this).add('TeamName', props.teamName);
    cdk.Tags.of(this).add('RepositoryUrl', props.repositoryUrl);
    cdk.Tags.of(this).add('Version', props.version);
    cdk.Tags.of(this).add('CostCenter', props.costCenter);
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Retain', 'true');

    const kmsKeyFactory = new KmsKeyFactory(this, props.serviceName);
    const lambdaFactory = new LambdaFactory(this, props.serviceName);
    const roleHelper = new RoleHelper(this, props.serviceName);
    const snsProviderFactory = new SnsProviderFactory(
      this,
      props.serviceName,
      kmsKeyFactory,
    );

    const logKey = kmsKeyFactory.createKey('logkey', {
      alias: 'logkey',
      enabedKeyRotation: true,
      removalPolicy: isEphemeralEnvironment()
        ? cdk.RemovalPolicy.DESTROY
        : cdk.RemovalPolicy.RETAIN,
    });

    roleHelper.addToResourcePolicyTokmsKey(this, logKey.key);

    const staleStackDeletionFunction = lambdaFactory.createSQSTriggeredLambda(
      'StackDeletionLambda',
      {
        queueName: namingProvider?.getResourceName(appConfig.queueName)
          ? namingProvider?.getResourceName(appConfig.queueName)
          : appConfig.queueName,
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../dist/staleStackDeletion'),
        ),
        description: 'Deletes stacks as request for data on the queue',
        duration: appConfig.lambdaMaxDuration,
        key: logKey.key,
        handler: 'index.handler',
        memorySize: 128,
        methods: ['get'],
        name: 'stackDeletion',
        path: '/customers/{customerId}/{dataType}',
        retentionDays: appConfig.logRetentionDuration,
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        skipCheckovRule: 'CKV_AWS_59',
        enableEncryption: false,
        retentionPeriod: cdk.Duration.days(appConfig.retentionPeriod),
        visibiltyTimeout: cdk.Duration.seconds(
          appConfig.visibiltyTimeoutSeconds,
        ),
        enableQueueTrigger: true,
        batchSize: appConfig.batchSize,
        maxBatchingWindow: cdk.Duration.minutes(appConfig.maxBatchingWindow),
        scope: this,
        namingProvider: this.namingProvider,
      },
    );

    roleHelper.addSQSOperationPermissionsToLambda({
      id: 'sqsReading',
      lambda: staleStackDeletionFunction.lambda,
      queue: staleStackDeletionFunction.queue,
      operations: [Operations.UPDATE, Operations.READ],
      scope: this,
      namingProvider: this.namingProvider,
    });

    const detectStaleStacksFunction = lambdaFactory.createScheduledLambda(
      'stackDetectionLambda',
      {
        cronName: 'staleStackRunner',
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../dist/detectStaleStacks'),
        ),
        description: 'Get data from the database using the supplied id',
        duration: appConfig.lambdaMaxDuration,
        key: logKey.key,
        handler: 'index.handler',
        memorySize: 128,
        methods: ['get'],
        name: 'detectStale',
        path: '/customers/{customerId}/{dataType}',
        retentionDays: appConfig.logRetentionDuration,
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        skipCheckovRule: 'CKV_AWS_59',
        specificTimes: [
          { hour: appConfig.runTimeHour, minute: appConfig.runTimeMinute },
        ],
        scope: this,
      },
    );

    const snsEmailProvisder = snsProviderFactory.createEmailProvider(
      'stackCleanUpNotification',
      {
        topicName: 'stackCleanUpNotification',
        displayName: 'Stack Cleanup Emailer',
        emailAddresses: appConfig.notificationEmails,
        enableEncryption: false,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        publisherLambda: detectStaleStacksFunction.lambda,
      },
    );

    roleHelper.addSQSOperationPermissionsToLambda({
      id: 'sqsPublishing',
      lambda: detectStaleStacksFunction.lambda,
      queue: staleStackDeletionFunction.queue,
      operations: [Operations.UPDATE],
      scope: this,
      namingProvider: this.namingProvider,
    });

    lambdaFactory.addEnvironmentVariables(detectStaleStacksFunction.lambda, [
      {
        name: appVariables.DRY_RUN,
        value: appConfig.DryRun,
      },
      {
        name: appVariables.ENVIRONMENT_TO_PROCESS,
        value: appConfig.environmentToProcess,
      },
      {
        name: appVariables.ROLE_TO_ASSUME,
        value: appConfig.cleanupRole,
      },
      {
        name: appVariables.STALE_AFTER_DAYS,
        value: appConfig.staleAfterDays,
      },
      {
        name: appVariables.TOPIC_ARN,
        value: snsEmailProvisder.topic.topicArn,
      },
      {
        name: appVariables.TOPIC_NAME,
        value: snsEmailProvisder.topic.topicName,
      },
      {
        name: appVariables.QUEUE_ARN,
        value: `${staleStackDeletionFunction.queue.queueArn}`,
      },
      {
        name: appVariables.QUEUE_NAME,
        value: `${staleStackDeletionFunction.queue.queueName}`,
      },
      {
        name: appVariables.QUEUE_URL,
        value: `${staleStackDeletionFunction.queue.queueUrl}`,
      },
      {
        name: appVariables.FEATURE_ID,
        value: `PLAT-477`,
      },
    ]);

    lambdaFactory.addEnvironmentVariables(staleStackDeletionFunction.lambda, [
      {
        name: appVariables.ROLE_TO_ASSUME,
        value: appConfig.cleanupRole,
      },
      {
        name: appVariables.QUEUE_ARN,
        value: `${staleStackDeletionFunction.queue.queueArn}`,
      },
      {
        name: appVariables.QUEUE_NAME,
        value: `${staleStackDeletionFunction.queue.queueName}`,
      },
      {
        name: appVariables.QUEUE_URL,
        value: `${staleStackDeletionFunction.queue.queueUrl}`,
      },
      {
        name: appVariables.FEATURE_ID,
        value: `PLAT-476`,
      },
    ]);
  }
}
