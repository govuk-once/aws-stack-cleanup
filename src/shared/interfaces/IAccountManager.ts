import { Account } from '../../detectStaleStacks/lib/infra-account-library/models/accounts/Account';
import { IAssumedRole } from '../../detectStaleStacks/lib/interfaces/IAssumedRole';

export interface IAccountManager {
  getDevelopmentAccounts(): Account[];
  assumeRole(
    accountId: string,
    rolename: string,
    sessionName?: string,
  ): Promise<IAssumedRole>;
}
