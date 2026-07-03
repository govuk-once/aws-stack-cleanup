import AccountName from '../models/accounts/AccountName';
import { EnvLabel } from '../models/EnvLabel';
import { allAccounts } from './accounts';

describe('accounts', () => {
  it('Should be able to retrieve infra prod account data', () => {
    const infraProdAccount = allAccounts.find((account) => {
      return account.name == AccountName.govukAppInfraProduction;
    });

    expect(infraProdAccount).not.toBeUndefined();
    if (!infraProdAccount) return;

    expect(infraProdAccount.displayName).toEqual('govuk-app-infra-production');
    expect(infraProdAccount.id).toEqual('008341391450');
    expect(infraProdAccount.envLabel).toEqual(EnvLabel.prod);
    expect(infraProdAccount.OU).toBeUndefined();
    expect(infraProdAccount.dnsDomain).toBeUndefined();
    expect(infraProdAccount.accountGroup).toBeUndefined();
  });
});
