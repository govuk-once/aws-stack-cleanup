import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { GovUkOnceStack } from './auto-stack-cleanup-stack';
import {
  GovUkOnceEnvironments,
  serviceMetadata,
  getResourceNamePrefix,
} from '../constants/environment';
import { describe, test, expect, beforeEach } from 'vitest';

describe('GovUkOnceStack', () => {
  let app: cdk.App;
  let testStack: GovUkOnceStack;
  let template: Template;

  beforeEach(() => {
    // const environment = getEnvironment();
    app = new cdk.App();
    testStack = new GovUkOnceStack(app, 'TestStack', {
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

  test('Creates an S3 bucket with correct props', () => {
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Delete',
      Properties: {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      },
    });
  });

  test('Creates a KMS Key with EnableKeyRotation and KMS Key Alias', () => {
    template.hasResource('AWS::KMS::Key', {
      DeletionPolicy: 'Delete',
      Properties: {
        EnableKeyRotation: true,
      },
    });
    template.hasResource('AWS::KMS::Alias', {
      Properties: {
        AliasName: `alias/${getResourceNamePrefix()}-key`,
      },
    });
  });

  test('Creates CloudWatch Alarms for API Gateway and Lambda', () => {
    template.resourceCountIs('AWS::CloudWatch::Alarm', 2);

    // API Gateway 5xx error rate alarm
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      ComparisonOperator: 'GreaterThanThreshold',
      Threshold: 5,
      TreatMissingData: 'notBreaching',
      Metrics: Match.arrayWith([
        Match.objectLike({
          Expression: '(errors / requests) * 100',
        }),
      ]),
    });

    // Lambda error rate alarm
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      ComparisonOperator: 'GreaterThanThreshold',
      Threshold: 1,
      TreatMissingData: 'notBreaching',
      Metrics: Match.arrayWith([
        Match.objectLike({
          Expression: '(errors / invocations) * 100',
        }),
      ]),
    });
  });

  test('Creates SNS Topic for alarm notifications', () => {
    template.hasResourceProperties('AWS::SNS::Topic', {
      TopicName: `${getResourceNamePrefix()}-alarms`,
    });
  });

  test('Alarms publish to the SNS Topic', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmActions: Match.arrayWith([
        Match.objectLike({ Ref: Match.anyValue() }),
      ]),
      OKActions: Match.arrayWith([Match.objectLike({ Ref: Match.anyValue() })]),
    });
  });
});
