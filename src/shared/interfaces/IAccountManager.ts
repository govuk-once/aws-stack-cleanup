import { Account } from '../infra-account-library/models/accounts/Account';
import { IAssumedRole } from './IAssumedRole';

export interface IAccountManager {
  getDevelopmentAccounts(): Account[];
  assumeRole(
    accountId: string,
    rolename: string,
    sessionName?: string,
  ): Promise<IAssumedRole>;
}
