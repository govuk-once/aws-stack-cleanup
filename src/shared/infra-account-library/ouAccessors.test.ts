/* eslint-disable @typescript-eslint/no-unused-expressions */

import { allOus } from './data/ous';
import { OuName } from './models/ous/OuName';
import { getAllOus, getOu } from './ouAccessors';

describe('ouAccessors', () => {
  describe('getOu', () => {
    it('Should be able to retrieve ou Root account', () => {
      const rootOu = getOu(OuName.Root);

      expect(rootOu.id).toEqual('r-x5ev');
      expect(rootOu.parentOu).toBeUndefined;
    });

    it("Should throw error when account details can't be found", () => {
      const fakeOuName = 'FakeOu' as OuName;
      const erroringFunctionCall = () => getOu(fakeOuName);

      expect(erroringFunctionCall).toThrow(
        Error(`Unable to find ou details for ${fakeOuName}`),
      );
    });
  });

  describe('getAllOus', () => {
    it('Should return all accounts we have', () => {
      expect(getAllOus().length).toEqual(allOus.length);
    });
  });
});
