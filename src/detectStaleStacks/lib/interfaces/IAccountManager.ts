import { Account } from '../infra-account-library/models/accounts/Account';
import { IAssumedRole } from './IAssumedRole';
import { IStsClient } from './ISTSClient';

export interface IAccountManager {
  getDevelopmentAccounts(): Account[];
  assumeRole(
    accountId: string,
    rolename: string,
    stsClient: IStsClient,
    sessionName?: string,
  ): Promise<IAssumedRole>;
}
