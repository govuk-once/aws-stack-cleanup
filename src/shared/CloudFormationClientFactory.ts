import { Credentials } from '@aws-sdk/client-sts';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { ICloudFormationClientFactory } from './interfaces/ICloudFormationClientFactory';
import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { ICloudFormationClient } from './interfaces/ICloudFormationClient';

export class CloudFormationClientFactory implements ICloudFormationClientFactory {
  public getClient(
    region: string,
    credentials?: Credentials,
  ): ICloudFormationClient {
    if (credentials) {
      const awsCredentialIdentity = this.convertCredentials(credentials);
      return new CloudFormationClient({
        region,
        credentials: awsCredentialIdentity,
      });
    }
    return new CloudFormationClient({ region });
  }

  public convertCredentials(credentials: Credentials): AwsCredentialIdentity {
    return {
      accessKeyId: credentials.AccessKeyId ?? '',
      secretAccessKey: credentials.SecretAccessKey ?? '',
      sessionToken: credentials.SessionToken,
    };
  }
}
