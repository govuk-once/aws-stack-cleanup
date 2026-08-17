import {
  LambdaFactory as baseLambdaFactory,
  ILambdaProperties,
} from '../../lib/LambdaFactory';
import { KmsKeyFactory } from './KmsKeyFactory';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { INamingProvider } from '../../lib/namingProviders/INamingProvider';
import { ServiceEnvironmentNamingProvider } from '../../lib/namingProviders/ServiceEnvironmentNamingProvider';

export interface IScheduledTime {
  hour: number;
  minute: number;
}

export interface IScheduledLambdaProps extends ILambdaProperties {
  cronName: string;

  /** Use either interval or sepcific times  not both*/
  interval?: cdk.Duration;
  specificTimes?: IScheduledTime[];
  // delete this once the construct library exposes it
  scope: Construct;
}

export interface ISqsLambdaProps extends ILambdaProperties {
  queueName: string;
  visibiltyTimeout: cdk.Duration;
  retentionPeriod: cdk.Duration;
  fifo?: boolean;
  enableEncryption: boolean;
  encryptionKey?: kms.IKey;
  enableQueueTrigger?: boolean;
  batchSize?: number;
  maxBatchingWindow?: cdk.Duration;

  // delete this once the construct library exposes it
  scope: Construct;
  namingProvider: INamingProvider;
}

export interface IScheduledLambda {
  lambda: lambda.IFunction;
  rules: events.Rule[];
}

export interface ISqsProcessingLambda {
  lambda: lambda.IFunction;
  queue: sqs.Queue;
}

export class LambdaFactory extends baseLambdaFactory {
  kmsKeyFactory: KmsKeyFactory;
  namingProvider1: INamingProvider;

  constructor(
    private readonly scope1: Construct,
    serviceName: string,
    namingProvider?: INamingProvider,
  ) {
    super(scope1, serviceName, namingProvider);

    this.namingProvider1 =
      namingProvider ?? new ServiceEnvironmentNamingProvider(serviceName);
    this.kmsKeyFactory = new KmsKeyFactory(scope1, serviceName, namingProvider);
  }

  public createSQSTriggeredLambda(
    id: string,
    props: ISqsLambdaProps,
  ): ISqsProcessingLambda {
    const lambdaFunction = this.createLambda(id, props);

    let encryptionKey: kms.IKey | undefined;

    if (props.enableEncryption) {
      encryptionKey =
        props.encryptionKey ??
        this.kmsKeyFactory.createKey(`${id}-LambdalogKey`, {
          alias: `${props.queueName}-key`,
          description: 'KMS Key to secure the queue',
          enabedKeyRotation: true,
        }).key;
    }

    const queue = new sqs.Queue(
      props.scope,
      props.namingProvider.getResourceName(id),
      {
        queueName: props.namingProvider.getResourceName(props.queueName),
        visibilityTimeout: cdk.Duration.seconds(
          props.visibiltyTimeout.toSeconds() > props.duration * 6
            ? props.visibiltyTimeout.toSeconds()
            : props.duration * 6,
        ),
        retentionPeriod: props.retentionPeriod,
        fifo: props.fifo ?? false,
        ...(props.enableEncryption && encryptionKey
          ? {
              encryption: sqs.QueueEncryption.KMS,
              encryptionMasterKey: encryptionKey,
            }
          : {}),
      },
    );

    if (encryptionKey) {
      encryptionKey.grant(lambdaFunction, 'kms:GenerateDataKey', 'kms:Decrypt');
    }

    if (props.enableQueueTrigger ?? true) {
      lambdaFunction.addEventSource(
        new lambdaEventSources.SqsEventSource(queue, {
          batchSize: props.batchSize ?? 10,
          maxBatchingWindow: props.maxBatchingWindow,
          reportBatchItemFailures: true,
        }),
      );
      queue.grantConsumeMessages(lambdaFunction);
    }

    return {
      lambda: lambdaFunction,
      queue,
    };
  }

  public createScheduledLambda(
    id: string,
    props: IScheduledLambdaProps,
  ): IScheduledLambda {
    if (!!props.interval === !!props.specificTimes) {
      throw new Error(
        'Invalid properties supply either interval or specificTimes not both',
      );
    }

    const lambdaFunction = this.createLambda(id, props);
    const rules: events.Rule[] = [];

    if (props.interval) {
      const rule = new events.Rule(props.scope, `${id}ScheduleRule`, {
        ruleName: props.cronName,
        schedule: events.Schedule.rate(props.interval),
      });

      rule.addTarget(new targets.LambdaFunction(lambdaFunction));
      rules.push(rule);
    }

    props.specificTimes?.forEach((time) => {
      const rule = new events.Rule(
        props.scope,
        `${id}ScheduleRule${time.hour}${time.minute}`,
        {
          ruleName:
            props.specificTimes!.length === 1
              ? props.cronName
              : `${props.cronName}-${time.hour}${time.minute}}`,
          schedule: events.Schedule.cron({
            hour: `${time.hour}`,
            minute: `${time.minute}`,
          }),
        },
      );

      rule.addTarget(new targets.LambdaFunction(lambdaFunction));
      rules.push(rule);
    });

    return {
      lambda: lambdaFunction,
      rules,
    };
  }
}

