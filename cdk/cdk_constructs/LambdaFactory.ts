import { LambdaFactory as lambdaFactory } from 'once-platform-constructs';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export interface ILambdaProperties extends lambda.FunctionProps {
  duration: number;
  key: cdk.aws_kms.Key;
  methods?: string[];
  name: string;
  path?: string;
  retentionDays?: logs.RetentionDays;
  skipCheckovRule?: string;
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
  // delete this once the construct library exposes it
  scope: Construct;
}

export interface IScheduledLambda {
  lambda: lambda.IFunction;
  rules: events.Rule[];
}

export interface ISqsProcessingLambda {
  lambda: lambda.IFunction;
  queue: sqs.Queue;
}

export class LambdaFactory extends lambdaFactory {
  public createSQSTriggeredLambda(
    id: string,
    props: ISqsLambdaProps,
  ): ISqsProcessingLambda {
    const lambda = this.createLambda(id, props);
    const queue = new sqs.Queue(props.scope, id, {});

    return {
      lambda,
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

    const lambda = this.createLambda(id, props);
    const rules: events.Rule[] = [];

    if (props.interval) {
      const rule = new events.Rule(props.scope, `${id}ScheduleRule`, {
        ruleName: props.cronName,
        schedule: events.Schedule.rate(props.interval),
      });

      rule.addTarget(new targets.LambdaFunction(lambda));
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
    });

    return {
      lambda,
      rules,
    };
  }
}
