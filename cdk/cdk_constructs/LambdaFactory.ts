import { Construct } from 'constructs';
import { KmsKeyFactory } from './KmsKeyFactory.js';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { INamingProvider } from './namingProviders/INamingProvider.js';
import { ServiceEnvironmentNamingProvider } from './namingProviders/ServiceEnvironmentNamingProvider.js';

export interface ILambdaProperties extends lambda.FunctionProps {
  duration: number;
  key: cdk.aws_kms.Key;
  methods?: string[];
  name: string;
  path?: string;
  retentionDays?: logs.RetentionDays;
  skipCheckovRule?: string;
}

export interface IEnvironmentVariable {
  name: string;
  value: string;
}

class constants {
  static MEMORY_SIZE = 256;
  static DURATION = 10;
  static METHODS = ['get'];
  static PATH_ERROR = 'PATH NOT SET';
  static RETENTION_DAYS: cdk.aws_logs.RetentionDays | undefined;
}

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

export class LambdaFactory {
  protected readonly scope: Construct;
  kmsKeyFactory: KmsKeyFactory;
  namingProvider: INamingProvider;

  constructor(
    scope: Construct,
    serviceName: string,
    namingProvider?: INamingProvider,
  ) {
    this.scope = scope;
    this.namingProvider =
      namingProvider ?? new ServiceEnvironmentNamingProvider(serviceName);
    this.kmsKeyFactory = new KmsKeyFactory(scope, serviceName, namingProvider);
  }

  createLambda(id: string, props: ILambdaProperties): lambda.Function {
    const namedProps = { ...props };
    namedProps.functionName = `${this.namingProvider.getResourceName(props.name)}`;
    namedProps.timeout = cdk.Duration.seconds(props.duration);
    const logId = this.namingProvider.getResourceId(id) ?? 'not set';
    const log = new logs.LogGroup(
      this.scope,
      `${logId}-LogGroup`,
      {
        logGroupName: `/aws/lambda/${this.namingProvider.getResourceName(namedProps.functionName)}`,
        retention: props.retentionDays
          ? props.retentionDays
          : constants.RETENTION_DAYS,
        encryptionKey: props.key,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );
    namedProps.logGroup = log;
    const newFunction = new lambda.Function(
      this.scope,
      logId,
      namedProps,
    );
    return newFunction;
  }

  // @deprecated Use addEnvironmentVariables instead
  addEnvironmentVariable(
    fn: lambda.IFunction,
    variable: IEnvironmentVariable,
  ): void {
    if (this.isLambdaFunction(fn)) {
      (fn as lambda.Function).addEnvironment(variable.name, variable.value);
    }
  }

  addEnvironmentVariables(
    fn: lambda.IFunction,
    variables: IEnvironmentVariable[],
  ): void {
    if (this.isLambdaFunction(fn)) {
      variables.forEach((en) =>
        (fn as lambda.Function).addEnvironment(en.name, en.value),
      );
    }
  }

  private isLambdaFunction = (fn: unknown): fn is lambda.Function => {
    return fn instanceof lambda.Function;
  };

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
