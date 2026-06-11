import { Construct } from 'constructs';
import { INamingProvider } from 'once-platform-constructs/namingProviders';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';

export interface IKmsKeyProps {
  alias: string;
  description?: string;
  enabedKeyRotation?: boolean;
  removalPolicy?: cdk.RemovalPolicy;
  admins?: iam.IPrincipal[];
}

export interface IKmsKey {
  key: kms.Key;
  alias: kms.Alias;
}

export class KmsKeyFactory {
  namingProvider: INamingProvider | undefined;

  constructor(
    protected readonly scope: Construct,
    serviceName: string,
    namingProvider?: INamingProvider,
  ) {
    this.namingProvider = namingProvider;
  }

  public createKey(id: string, props: IKmsKeyProps): IKmsKey {
    const key = new kms.Key(
      this.scope,
      `${this.namingProvider?.getResourceId(id)}`,
      {
        description: props.description,
        enableKeyRotation: props.enabedKeyRotation,
        removalPolicy: props.removalPolicy ?? cdk.RemovalPolicy.RETAIN,
        admins: props.admins,
      },
    );

    const aliasName = props.alias.startsWith('alias/')
      ? props.alias
      : `alias/${props.alias}`;

    const alias = new kms.Alias(
      this.scope,
      `${this.namingProvider?.getResourceId(`alias`)}`,
      {
        aliasName,
        targetKey: key,
      },
    );

    return { key, alias };
  }
}
