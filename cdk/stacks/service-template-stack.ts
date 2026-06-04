import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as path from 'path';
import { Construct } from 'constructs';
import {
  getResourceNamePrefix,
  isEphemeralEnvironment,
  generateUniqueId,
} from '../constants/environment';
import { StandardServiceAlarmsFactory } from '../cdk_constructs/StandardServiceAlarmsFactory';

import { ServiceParameters } from '../cdk_constructs/ServiceParameters';

export interface GovUkOnceStackProps extends cdk.StackProps {
  serviceName: string;
  teamName: string;
  repositoryUrl: string;
  version: string;
  environment: string;
  costCenter: string;
}

export class GovUkOnceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GovUkOnceStackProps) {
    super(scope, id, props);

    // Add standard tags to all resources in the stack
    cdk.Tags.of(this).add('ServiceName', props.serviceName);
    cdk.Tags.of(this).add('TeamName', props.teamName);
    cdk.Tags.of(this).add('RepositoryUrl', props.repositoryUrl);
    cdk.Tags.of(this).add('Version', props.version);
    cdk.Tags.of(this).add('CostCenter', props.costCenter);
    cdk.Tags.of(this).add('Environment', props.environment);

    const serviceParameters = new ServiceParameters(this);

    // Example KMS Key
    new cdk.aws_kms.Key(this, 'ServiceTemplateExampleKey', {
      alias: `${getResourceNamePrefix()}-key-${generateUniqueId()}`,
      enableKeyRotation: true,
      removalPolicy: isEphemeralEnvironment()
        ? cdk.RemovalPolicy.DESTROY
        : cdk.RemovalPolicy.RETAIN,
    });

    const logKey = new cdk.aws_kms.Key(this, 'ServiceTemplateExampleLogKey', {
      alias: `${getResourceNamePrefix()}-key`,
      enableKeyRotation: true,
      removalPolicy: isEphemeralEnvironment()
        ? cdk.RemovalPolicy.DESTROY
        : cdk.RemovalPolicy.RETAIN,
    });

    logKey.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [
          new iam.ServicePrincipal(`logs.${this.region}.amazonaws.com`),
        ],
        actions: [
          'kms:Encrypt',
          'kms:Decrypt',
          'kms:ReEncrypt*',
          'kms:GenerateDataKey*',
          'kms:DescribeKey',
        ],
        resources: ['*'],
      }),
    );

    // Example S3 Bucket
    new cdk.aws_s3.Bucket(this, 'ServiceTemplateExampleBucket', {
      bucketName: `${getResourceNamePrefix()}-bucket-${generateUniqueId()}`,
      removalPolicy: isEphemeralEnvironment()
        ? cdk.RemovalPolicy.DESTROY
        : cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: isEphemeralEnvironment(),
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      versioned: !isEphemeralEnvironment(),
    });

    // Example Lambda Function
    const myLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      'ServiceTemplateExampleFunction',
      {
        functionName: `${getResourceNamePrefix()}-function`,
        entry: path.join(__dirname, '../../src/helloworld/hello-world.ts'),
        handler: 'handler',
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        memorySize: 128,
        timeout: cdk.Duration.seconds(10),
      },
    );

    // Example REST API Gateway
    const api = new cdk.aws_apigateway.LambdaRestApi(
      this,
      'ServiceTemplateExampleApi',
      {
        restApiName: `${getResourceNamePrefix()}-api`,
        description: 'Example API Gateway for Service Template',
        handler: myLambda,
        proxy: true,
        cloudWatchRole: true,
        domainName: {
          domainName: `${getResourceNamePrefix()}.${serviceParameters.hostedZoneName()}`,
          certificate: serviceParameters.certificate(),
        },
      },
    );

    // Example new DNS record for API Gateway
    new cdk.aws_route53.ARecord(this, 'ApiAliasRecord', {
      zone: serviceParameters.zone(),
      recordName: `${getResourceNamePrefix()}`,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.ApiGateway(api),
      ),
    });

    // Standard CloudWatch Alarms for API Gateway and Lambda
    const alarmTopic = new sns.Topic(this, 'ServiceAlarmTopic', {
      topicName: `${getResourceNamePrefix()}-alarms`,
      displayName: `${getResourceNamePrefix()} Service Alarms`,
    });

    const alarmsFactory = new StandardServiceAlarmsFactory(
      this,
      props.serviceName,
    );

    alarmsFactory.createAlarms('ServiceAlarms', {
      restApis: [api],
      lambdas: [myLambda],
      alarmTopic: alarmTopic,
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `https://${getResourceNamePrefix()}.${serviceParameters.hostedZoneName()}`,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: alarmTopic.topicArn,
      description: 'SNS Topic ARN for CloudWatch Alarms',
    });
  }
}
