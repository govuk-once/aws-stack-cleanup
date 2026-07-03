import { AssumeRoleCommand } from '@aws-sdk/client-sts';
import { describe, test, expect, vi } from 'vitest';

import { AccountManager } from './accountManager';
import { Account } from './infra-account-library/models/accounts/Account';
import { IStsClient } from '../shared/interfaces/IStsClient';

describe('Account Manager functional tests', () => {
  test('Should be able to get a list of all dev accounts', () => {
    const accountManager = new AccountManager();

    const accounts = accountManager.getDevelopmentAccounts();

    expect(accounts.length).toBe(4);

    let itemUnderTest: Account;

    itemUnderTest = accounts.find((a) => a.name === 'govuk-app-bl-development');
    expect(itemUnderTest).toBeDefined();

    itemUnderTest = accounts.find((a) => a.name === 'govuk-app-infra-sandbox');
    expect(itemUnderTest).toBeDefined();

    itemUnderTest = accounts.find(
      (a) => a.name === 'govuk-app-udp-development',
    );
    expect(itemUnderTest).toBeDefined();

    itemUnderTest = accounts.find(
      (a) => a.name === 'govuk-app-notifications-development',
    );
    expect(itemUnderTest).toBeDefined();
  });

  test('Should be able to assume role', async () => {
    const mockCredentials = {
      AccessKeyId: 'test-access-key',
      SecretAccessKey: 'test-secrete-key',
      SessionToken: ' test-session-token',
      Expiration: new Date('2030-01-01T00:00:00z'),
    };

    const sendMock = vi.fn().mockResolvedValue({
      Credentials: mockCredentials,
    });

    const mockStsClient: IStsClient = {
      send: sendMock,
    };

    const accountManager = new AccountManager(mockStsClient);

    const account = accountManager.getDevelopmentAccounts()[0];

    const role = await accountManager.assumeRole(account.id, 'testRole');

    expect(sendMock).toHaveBeenCalledTimes(1);

    const command = sendMock.mock.calls[0][0];

    expect(command).toBeInstanceOf(AssumeRoleCommand);
    expect(command.input).toMatchObject({
      RoleArn: `arn:aws:iam::${account.id}:role/testRole`,
    });

    expect(role.credentials).toEqual(mockCredentials);
    expect(role.valid).toBeTruthy();
  });

  test('Shouldnt be able to assume role', async () => {
    const sendMock = vi.fn().mockResolvedValue({});

    const mockStsClient: IStsClient = {
      send: sendMock,
    };

    const accountManager = new AccountManager(mockStsClient);
    const account = accountManager.getDevelopmentAccounts()[0];

    const role = await accountManager.assumeRole(account.id, 'testRole');

    expect(sendMock).toHaveBeenCalledTimes(1);

    const command = sendMock.mock.calls[0][0];

    expect(command).toBeInstanceOf(AssumeRoleCommand);
    expect(command.input).toMatchObject({
      RoleArn: `arn:aws:iam::${account.id}:role/testRole`,
    });

    expect(role.credentials).toBeUndefined();
    expect(role.valid).toBeFalsy();
  });
});
