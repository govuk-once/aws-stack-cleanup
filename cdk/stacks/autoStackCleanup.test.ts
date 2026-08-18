import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AutoStackCleanupStack } from './autoStackCleanupStack';
import {
  GovUkOnceEnvironments,
  serviceMetadata,
} from '../constants/environment';
import { describe, test, expect, beforeEach } from 'vitest';

describe('stale Stack Deletion', () => {
  let app: cdk.App;
  let testStack: AutoStackCleanupStack;
  let template: Template;

  beforeEach(() => {
    // const environment = getEnvironment();
    app = new cdk.App();
    testStack = new AutoStackCleanupStack(app, 'TestStack', {
      env: {
        account: '123456789012',
        region: 'eu-west-2',
      },
      serviceName: serviceMetadata.serviceName,
      teamName: serviceMetadata.teamName,
      repositoryUrl: serviceMetadata.repositoryUrl,
      version: serviceMetadata.version,
      costCenter: serviceMetadata.costCenter,
      environment: GovUkOnceEnvironments.Test,
    });
    template = Template.fromStack(testStack);
  });

  test('Stack is created', () => {
    expect(testStack).toBeDefined();
  });

  test('Creates the log Key', () => {
    template.hasResource('AWS::KMS::Key', {
      Properties: {
        EnableKeyRotation: true,
      },
      DeletionPolicy: 'Delete',
    });
  });

  test('Creates the StackCleanUp Queue', () => {
    template.hasResource('AWS::SQS::Queue', {
      DeletionPolicy: 'Delete',

      UpdateReplacePolicy: 'Delete',
      Properties: {
        MessageRetentionPeriod: 86400,
        QueueName: Match.stringLikeRegexp('StackCleanup'),
        VisibilityTimeout: 3600,
      },
    });
  });

  test('Creates the stale Stack Deletion Lambda', () => {
    template.hasResource('AWS::Lambda::Function', {
      Properties: {
        FunctionName: Match.stringLikeRegexp('stackDeletion'),
      },
    });
  });

  test('Creates Event source mapping for the queue and Lambda', () => {
    template.resourceCountIs('AWS::Lambda::EventSourceMapping', 1);

    template.hasResource('AWS::Lambda::EventSourceMapping', {
      Properties: {
        BatchSize: 1,
        FunctionName: { Ref: Match.stringLikeRegexp('stackdeletion') },
        FunctionResponseTypes: ['ReportBatchItemFailures'],
        MaximumBatchingWindowInSeconds: 60,
      },
    });
  });

  test('Creates the detect Stale Stacks Lambda', () => {
    template.hasResource('AWS::Lambda::Function', {
      Properties: {
        FunctionName: Match.stringLikeRegexp('detectStale'),
      },
    });
  });

  test('Creates the email SNS Topic', () => {
    template.hasResource('AWS::SNS::Topic', {
      Properties: {
        DisplayName: 'Stack Cleanup Emailer',
        Tags: [
          {
            Key: 'CostCenter',
            Value: 'not Known',
          },
          {
            Key: 'Environment',
            Value: 'test',
          },
          {
            Key: 'RepositoryUrl',
            Value: 'https://github.com/govuk-once/aws-stack-cleanup',
          },
          {
            Key: 'Retain',
            Value: 'true',
          },
          {
            Key: 'ServiceName',
            Value: 'asc',
          },
          {
            Key: 'TeamName',
            Value: 'platform-team',
          },
          {
            Key: 'Version',
            Value: '0.1.0',
          },
        ],
        TopicName: 'stackCleanUp',
      },
      UpdateReplacePolicy: 'Delete',
      DeletionPolicy: 'Delete',
    });
  });

  test('Creates the email subscription', () => {
    template.hasResource('AWS::SNS::Subscription', {
      Properties: {
        Endpoint: 'govuk-once-platform-dl@digital.cabinet-office.gov.uk',
        Protocol: 'email',
        TopicArn: {
          Ref: Match.stringLikeRegexp('stackcleanup'),
        },
      },
    });
  });

  test('Creates a cron job to call detect Stale Stacks Lambda', () => {
    template.hasResource('AWS::Events::Rule', {
      Properties: {
        Name: 'staleStackRunner',
        ScheduleExpression: 'cron(10 0 * * ? *)',
        State: 'ENABLED',
        Targets: [
          {
            Arn: {
              'Fn::GetAtt': [
                Match.stringLikeRegexp('stackdetectionlambda'),
                'Arn',
              ],
            },
            Id: 'Target0',
          },
        ],
      },
    });
  });
});
