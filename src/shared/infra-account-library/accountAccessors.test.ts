import { getAccountDetails, getAllAccounts } from './accountAccessors';
import { allAccounts } from './data/accounts';
import AccountName from './models/accounts/AccountName';
import { EnvLabel } from './models/EnvLabel';

describe('accountAccessors', () => {
  describe('getAccountDetails', () => {
    it('Should be able to retrieve infra prod account data', () => {
      const infraProdAccount = getAccountDetails(
        AccountName.govukAppInfraProduction,
      );

      expect(infraProdAccount.displayName).toEqual(
        'govuk-app-infra-production',
      );
      expect(infraProdAccount.id).toEqual('008341391450');
      expect(infraProdAccount.envLabel).toEqual(EnvLabel.prod);
      expect(infraProdAccount.OU).toBeUndefined();
      expect(infraProdAccount.dnsDomain).toBeUndefined();
      expect(infraProdAccount.accountGroup).toBeUndefined();
    });

    it("Should throw error when account details can't be found", () => {
      const fakeAccountName = 'UnknownAccount' as AccountName;
      const erroringFunctionCall = () => getAccountDetails(fakeAccountName);

      expect(erroringFunctionCall).toThrow(
        Error(`Unable to find account details for ${fakeAccountName}`),
      );
    });
  });

  describe('getAllAcounts', () => {
    it('Should return all accounts we have', () => {
      const allAccountsViaFunction = getAllAccounts();

      expect(allAccountsViaFunction.length).toEqual(allAccounts.length);
    });
  });
});
