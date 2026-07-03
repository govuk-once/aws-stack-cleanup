import { OuName } from './OuName';

export interface Ou {
  name: OuName;
  displayName: string;
  id: string;
  orgPath: string;
  orgFullPath: string;
  parentOu?: OuName;
}

export default Ou;
