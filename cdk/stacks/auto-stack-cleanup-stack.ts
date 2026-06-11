import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';

import { isEphemeralEnvironment } from '../constants/environment';

import { INamingProvider } from 'once-platform-constructs/namingProviders';
import { ServiceEnvironmentNamingProvider } from 'once-platform-constructs/namingProviders';
import { LambdaFactory } from '../cdk_constructs/LambdaFactory';
//import { RoleHelper, CrudOperations } from 'once-platform-constructs';
import { RoleHelper, Operations } from '../cdk_constructs/RoleHelper';
import { KmsKeyFactory } from '../cdk_constructs/KmsKeyFactory';

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

    const logKey = kmsKeyFactory.createKey('logkey', {
      alias: 'logkey',
      enabedKeyRotation: true,
      removalPolicy: isEphemeralEnvironment()
        ? cdk.RemovalPolicy.DESTROY
        : cdk.RemovalPolicy.RETAIN,
    });

    roleHelper.addToResourcePolicyTokmsKey(this, logKey.key);

    const staleStackDeletionFunction = lambdaFactory.createSQSTriggeredLambda(
      'staleStackCleanupLambda',
      {
        queueName: 'staleStackCleanup',
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../dist/readLambda'),
        ),
        description: 'Get data from the database using the supplied id',
        duration: 10,
        key: logKey.key,
        handler: 'index.handler',
        memorySize: 128,
        methods: ['get'],
        name: 'getData',
        path: '/customers/{customerId}/{dataType}',
        retentionDays: logs.RetentionDays.FOUR_MONTHS,
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        skipCheckovRule: 'CKV_AWS_59',
        enableEncryption: true,
        retentionPeriod: cdk.Duration.days(1),
        visibiltyTimeout: cdk.Duration.days(1),
        enableQueueTrigger: true,
        batchSize: 10,
        maxBatchingWindow: cdk.Duration.minutes(4),
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
      'staleStackLambda',
      {
        cronName: 'staleStackRunner',
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../dist/readLambda'),
        ),
        description: 'Get data from the database using the supplied id',
        duration: 10,
        key: logKey.key,
        handler: 'index.handler',
        memorySize: 128,
        methods: ['get'],
        name: 'getData',
        path: '/customers/{customerId}/{dataType}',
        retentionDays: logs.RetentionDays.FOUR_MONTHS,
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        skipCheckovRule: 'CKV_AWS_59',
        specificTimes: [{ hour: 0, minute: 10 }],
        scope: this,
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
        name: 'roleToAssume',
        value: 'stackCleanupRole',
      },
      {
        name: 'staleAfterDays',
        value: '60',
      },
      {
        name: 'queueArn',
        value: `${staleStackDeletionFunction.queue.queueArn}`,
      },
      {
        name: 'queueName',
        value: `${staleStackDeletionFunction.queue.queueName}`,
      },
      {
        name: 'queueUrl',
        value: `${staleStackDeletionFunction.queue.queueUrl}`,
      },
    ]);
  }
}
