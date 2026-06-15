import { RoleHelper as roleHelper } from 'once-platform-constructs';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { INamingProvider } from 'once-platform-constructs/namingProviders';
import { IKey } from 'aws-cdk-lib/aws-kms';
import { Stack } from 'aws-cdk-lib';

export enum Operations {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LIST = 'LIST',
  ALL = 'ALL',
}

export interface IRoleHelperProps {
  id: string;
  lambda: lambda.IFunction;
  table?: dynamodb.ITable;
  bucket?: s3.IBucket;
  queue?: sqs.Queue;
  operations: Operations[];
  role?: iam.Role;

  //remove once added to main system
  scope: Construct;
  namingProvider: INamingProvider;
}

export class RoleHelper extends roleHelper {
  public addToResourcePolicyTokmsKey(scope: Construct, key: IKey) {
    key.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [
          new iam.ServicePrincipal(
            `logs.${Stack.of(scope).region}.amazonaws.com`,
          ),
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
  }

  public addSQSOperationPermissionsToLambda(props: IRoleHelperProps): iam.Role {
    if (!props.queue) throw 'queue must be supplied to add sqs roles to lambda';

    const role = this.findOrCreateRoleTemp(props);

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: this.createQueueOperations(props.operations),
        resources: [props.queue.queueArn, `${props.queue.queueArn}/index/*`],
      }),
    );

    return role;
  }

  private createQueueOperations(operations: Operations[]): string[] {
    const set = new Set<string>();

    operations.forEach((operation) => {
      switch (operation) {
        case Operations.CREATE:
          throw 'Create is not supported for SQS queues';
          break;
        case Operations.READ:
          set.add('sqs:GetQueueAttibutes');
          set.add('sqs:GetQueueUrl');
          set.add('sqs:ReceiveMessage');
          break;
        case Operations.UPDATE:
          set.add('sqs:SendMessage');
          set.add('sqs:SendMessageBatch');
          set.add('sqs:ChangeMessageVisibilty');
          set.add('sqs:ChangeMessageVisibiltyBatch');
          set.add('sqs:SetQueueAttributes');
          break;
        case Operations.DELETE:
          set.add('sqs:DeleteMessage');
          set.add('sqs:DeleteMessageBatch');
          set.add('sqs:PurgeQueue');
          break;
        case Operations.LIST:
          set.add('sqs:ListQueues');
          set.add('sqs:ListQueueTags');
          set.add('sqs:ListDeadLetterSourcesQueues');
          break;
      }
    });

    return [...set];
  }

  private findOrCreateRoleTemp(props: IRoleHelperProps): iam.Role {
    if (props.role) return props.role;

    const roleCandidate = (props.lambda as lambda.Function).role;

    if (roleCandidate) return roleCandidate as iam.Role;

    return new iam.Role(
      props.scope,
      props.namingProvider.getResourceId(props.id) ?? 'noId',
      {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        description: `Role assumed by lambda: ${props.lambda.functionName} for resource access`,
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaBasicExecutionRole',
          ),
        ],
      },
    );
  }
}
