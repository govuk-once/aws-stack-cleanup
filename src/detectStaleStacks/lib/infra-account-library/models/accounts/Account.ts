import { EnvLabel } from '../EnvLabel';
import AccountGroup from './AccountGroup';
import AccountName from './AccountName';
import { AccountTag } from './AccountTag';

export interface Account {
  name: AccountName;
  displayName: string;
  id: string;
  envLabel: EnvLabel;
  OU?: string;
  dnsDomain?: string;
  accountGroup?: AccountGroup;
  tags?: AccountTag[];
}

export default Account;
