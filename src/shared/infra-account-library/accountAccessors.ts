import { allAccounts } from './data/accounts';
import Account from './models/accounts/Account';
import AccountName from './models/accounts/AccountName';

export function getAccountDetails(accountName: AccountName): Account {
  const match = allAccounts.find((account) => account.name === accountName);
  if (!match)
    throw new Error(`Unable to find account details for ${accountName}`);

  return match;
}

export function getAllAccounts(): Account[] {
  return allAccounts;
}
