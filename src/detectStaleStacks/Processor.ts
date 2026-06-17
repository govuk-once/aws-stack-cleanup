import { IAccountManager } from './lib/interfaces/IAccountManager';
import { IStackManager } from './lib/interfaces/IStackManager';
import { AccountManager } from './lib/accountManager';
import { StackManager } from './lib/stackManager';
import { appVariables } from '../shared/appConfig';

export class Processor {
  constructor(
    protected accountManager: IAccountManager = new AccountManager(),
    protected stackManager: IStackManager = new StackManager(),
  ) {}

  public async Run(): Promise<void> {
    const accounts = this.accountManager.getDevelopmentAccounts();

    accounts.forEach(async (account) => {
      await this.accountManager.assumeRole(
        account.id,
        appVariables.ROLE_TO_ASSUME,
      );
      await this.processStacks();
    });
  }

  protected async processStacks(): Promise<void> {
    const stacks = await this.stackManager.getStacks();
  }
}
