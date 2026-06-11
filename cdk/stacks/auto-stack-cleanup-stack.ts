import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';

import { isEphemeralEnvironment } from '../constants/environment';

import { INamingProvider } from 'once-platform-constructs/namingProviders';
import { ServiceEnvironmentNamingProvider } from 'once-platform-constructs/namingProviders';
import { LambdaFactory } from '../cdk_constructs/LambdaFactory';
import { ServiceParameters } from 'once-platform-constructs';
//import { RoleHelper, CrudOperations } from 'once-platform-constructs';
import { RoleHelper, Operations } from '../cdk_constructs/RoleHelper';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';

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

    // retrieve parameters from SSM Parameter Store

    const serviceParameters = new ServiceParameters(this);

    const logKey = new cdk.aws_kms.Key(this, 'logkey', {
      alias: `${this.namingProvider.getResourceName('logkey')}`,
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
    const lambdaFactory = new LambdaFactory(this, props.serviceName);
    const roleHelper = new RoleHelper(this, props.serviceName);

    const staleStackCleanupFunction = lambdaFactory.createSQSTriggeredLambda(
      'staleStackCleanupLambda',
      {
        queueName: 'staleStackCleanup',
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../dist/readLambda'),
        ),
        description: 'Get data from the database using the supplied id',
        duration: 10,
        key: logKey,
        handler: 'index.handler',
        memorySize: 128,
        methods: ['get'],
        name: 'getData',
        path: '/customers/{customerId}/{dataType}',
        retentionDays: logs.RetentionDays.FOUR_MONTHS,
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        skipCheckovRule: 'CKV_AWS_59',
        scope: this,
      },
    );

    const staleStackFunction = lambdaFactory.createScheduledLambda(
      'staleStackLambda',
      {
        cronName: 'staleStackRunner',
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../dist/readLambda'),
        ),
        description: 'Get data from the database using the supplied id',
        duration: 10,
        key: logKey,
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
      lambda: staleStackFunction.lambda,
      queue: staleStackCleanupFunction.queue,
      operations: [Operations.UPDATE],
      scope: this,
      namingProvider: this.namingProvider,
    });

    const writeFuntion = lambdaFactory.createLambdaWithApiRoute(
      'writeDataLambda',
      {
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../dist/writeLambda'),
        ),
        description: 'Writes data from the database using the supplied id',
        duration: 10,
        key: logKey,
        handler: 'index.handler',
        memorySize: 128,
        methods: ['post'],
        name: 'writeData',
        path: '/customers/{customerId}/{dataType}',
        retentionDays: logs.RetentionDays.ONE_WEEK,
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        skipCheckovRule: 'CKV_AWS_59',
      },
    );

    lambdaFactory.addEnvironmentVariable(writeFuntion.lambda, {
      name: 'tableName',
      value: `${table.tableName}`,
    });

    roleHelper.addDynamoOperationPermissionsToLambda({
      id: 'lamdbaWrite',
      lambda: writeFuntion.lambda,
      table: table,
      operations: [CrudOperations.CREATE, CrudOperations.UPDATE],
    });

    const deleteFuntion = lambdaFactory.createLambdaWithApiRoute(
      'deleteDataLambda',
      {
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../dist/deleteLambda'),
        ),
        description: 'Deletes data from the database using the supplied id',
        duration: 10,
        key: logKey,
        handler: 'index.handler',
        memorySize: 128,
        methods: ['delete'],
        name: 'deleteData',
        path: '/customers/{customerId}/{dataType}',
        retentionDays: logs.RetentionDays.ONE_WEEK,
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        skipCheckovRule: 'CKV_AWS_59',
      },
    );

    lambdaFactory.addEnvironmentVariable(deleteFuntion.lambda, {
      name: 'tableName',
      value: `${table.tableName}`,
    });

    roleHelper.addDynamoOperationPermissionsToLambda({
      id: 'lamdbaDelete',
      lambda: deleteFuntion.lambda,
      table: table,
      operations: [CrudOperations.DELETE],
    });

    const pythonDeleteFuntion = lambdaFactory.createLambdaWithApiRoute(
      'pythonDeleteDataLambda',
      {
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../dist/pythonDeleteLambda'),
        ),
        description: 'Deletes data from the database using the supplied id',
        duration: 10,
        key: logKey,
        handler: 'index.handler',
        memorySize: 128,
        methods: ['delete'],
        name: 'pythonDeleteData',
        path: '/customers/p/{customerId}/{dataType}',
        retentionDays: logs.RetentionDays.ONE_WEEK,
        runtime: cdk.aws_lambda.Runtime.PYTHON_3_12,
        skipCheckovRule: 'CKV_AWS_59',
      },
    );

    lambdaFactory.addEnvironmentVariable(pythonDeleteFuntion.lambda, {
      name: 'tableName',
      value: `${table.tableName}`,
    });

    roleHelper.addDynamoOperationPermissionsToLambda({
      id: 'pythonlamdbaDelete',
      lambda: pythonDeleteFuntion.lambda,
      table: table,
      operations: [CrudOperations.DELETE],
    });

    const api = apiFactory.createApiGatewayRouter('dataManagementapi', {
      cacheDurationSeconds: 1,
      description: 'Allows for data storage and management',
      key: logKey,
      name: 'dataManagementapi',
      domainName: {
        domainName: `${this.namingProvider.getPreFix()}.${serviceParameters.zone().zoneName}`,
        certificate: serviceParameters.certificate(),
      },
    });

    apiFactory.addRoutes(
      [getFuntion, writeFuntion, deleteFuntion, pythonDeleteFuntion],
      api,
    );

    const dashBoard = dashBoardFactory.createDashboard('dataStoreDashboard', {
      name: 'dataStoreDashboard',
      restApis: [api],
      lambdas: [
        getFuntion.lambda,
        writeFuntion.lambda,
        deleteFuntion.lambda,
        pythonDeleteFuntion.lambda,
      ],
      tables: [table],
    });

    // Example new DNS record for API Gateway
    new cdk.aws_route53.ARecord(this, 'ApiAliasRecord', {
      zone: serviceParameters.zone(),
      recordName: `${this.namingProvider.getPreFix()}`,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.ApiGateway(api),
      ),
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `https://${this.namingProvider.getPreFix()}.${serviceParameters.zone().zoneName}`,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'Dashboard', {
      value: dashBoard.dashboardName,
      description: 'System dashboard',
    });
  }
}
