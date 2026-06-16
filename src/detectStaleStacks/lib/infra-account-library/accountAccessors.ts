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

// not added all tagging information yet so this function is not fully implemented, but the idea is to be able to filter accounts by tags and environment

// export function getAllAccountsByTags(tags: AccountTag[], env?: EnvLabel): Account[] {
//   const matchedAccounts: Account[] = [];
//   allAccounts.forEach((account) => {
//     let match = true;
//     tags.forEach((tag) => {
//       if (!account.tags.includes(tag)) {
//         match = false;
//       }
//     });

//     if (env) {
//       if (account.envLabel != env) match = false;
//     }

//     if (match) matchedAccounts.push(account);
//   });

//   return matchedAccounts;
// }
