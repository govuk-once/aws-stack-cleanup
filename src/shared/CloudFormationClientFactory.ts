import { ICloudFormationClientFactory } from './interfaces/ICloudFormationClientFactory';
import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { Credentials } from '@aws-sdk/client-sts';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { ICloudFormationClient } from './interfaces/ICloudFormationClient';

export class CloudFormationClientFactory implements ICloudFormationClientFactory {
  public getClient(
    region: string,
    credentials: Credentials,
  ): ICloudFormationClient {
    const awsCredentialIdentity = this.convertCredentials(credentials);
    return new CloudFormationClient({
      region,
      credentials: awsCredentialIdentity,
    });
  }

  public convertCredentials(credentials: Credentials): AwsCredentialIdentity {
    return {
      accessKeyId: credentials.AccessKeyId ?? '',
      secretAccessKey: credentials.SecretAccessKey ?? '',
      sessionToken: credentials.SessionToken,
    };
  }
}
