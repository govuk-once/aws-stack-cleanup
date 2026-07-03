// this is to be replaced once Infra-account-library is in the share packahe library
import { getAccountDetails } from './infra-account-library';
import { Account } from './infra-account-library/models/accounts/Account';
import { AccountName } from './infra-account-library/models/accounts/AccountName';

import { IAccountManager } from './interfaces/IAccountManager';
import { IAssumedRole } from './interfaces/IAssumedRole';
import { IStsClient } from '../../shared/interfaces/IStsClient';

import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';

export class AccountManager implements IAccountManager {
  constructor(protected stsClient: IStsClient = new STSClient({})) {}

  public getDevelopmentAccounts(): Account[] {
    const result: Account[] = [];

    result.push(getAccountDetails(AccountName.govukAppBlDevelopment));
    result.push(getAccountDetails(AccountName.govukAppInfraSandbox));
    result.push(getAccountDetails(AccountName.govukAppUdpDevelopment));
    result.push(
      getAccountDetails(AccountName.govukAppNotificationsDevelopment),
    );

    return result;
  }

  public async assumeRole(
    accountId: string,
    rolename: string,

    sessionName?: string,
  ): Promise<IAssumedRole> {
    const roleArn = `arn:aws:iam::${accountId}:role/${rolename}`;

    const response = await this.stsClient.send(
      new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: sessionName ?? `session-${Date.now()}`,
      }),
    );

    return {
      credentials: response.Credentials,
      error: response.$metadata?.httpStatusCode,
      valid: response.Credentials != null,
    };
  }
}
