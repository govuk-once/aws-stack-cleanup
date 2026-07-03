import { allOus } from './data/ous';
import Ou from './models/ous/Ou';
import { OuName } from './models/ous/OuName';

export function getOu(ouName: OuName): Ou {
  const match = allOus.find((ou) => ou.name === ouName);
  if (!match) throw new Error(`Unable to find ou details for ${ouName}`);

  return match;
}

export function getAllOus(): Ou[] {
  return allOus;
}
