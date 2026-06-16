import Ou from '../models/ous/Ou';
import { OuName } from '../models/ous/OuName';

export const gdsOrgId = 'o-5f5t4fovlx';
export const rootOuId = 'r-x5ev';
export const workloadsOuId = 'ou-x5ev-r4pjp74a';
export const onceOuId = 'ou-x5ev-6swo2xkp';
export const onceWorkloadsOuId = 'ou-x5ev-m1vtyyw0';

export const allOus: Ou[] = [
  {
    name: OuName.Root,
    displayName: 'root',
    id: rootOuId,
    orgPath: `${gdsOrgId}/${rootOuId}`,
    orgFullPath: `${gdsOrgId}/${rootOuId}`,
  },
  {
    name: OuName.Workloads,
    displayName: 'Transition',
    id: workloadsOuId,
    orgPath: `${gdsOrgId}/${workloadsOuId}`,
    orgFullPath: `${gdsOrgId}/${rootOuId}/${workloadsOuId}`,
    parentOu: OuName.Root,
  },
  {
    name: OuName.GOVUKOnce,
    displayName: 'GOV.UK Once',
    id: onceOuId,
    orgPath: `${gdsOrgId}/${onceOuId}`,
    orgFullPath: `${gdsOrgId}/${rootOuId}/${workloadsOuId}/${onceOuId}`,
    parentOu: OuName.Workloads,
  },
  {
    name: OuName.GOVUKOnceInfra,
    displayName: 'GOV.UK Once Infra',
    id: 'ou-x5ev-bz7br75x',
    orgPath: `${gdsOrgId}/ou-x5ev-bz7br75x`,
    orgFullPath: `${gdsOrgId}/${rootOuId}/${workloadsOuId}/${onceOuId}/ou-x5ev-bz7br75x`,
    parentOu: OuName.GOVUKOnce,
  },
  {
    name: OuName.GOVUKOnceSandbox,
    displayName: 'GOV.UK Once Sandbox',
    id: 'ou-x5ev-0xomc641',
    orgPath: `${gdsOrgId}/ou-x5ev-0xomc641`,
    orgFullPath: `${gdsOrgId}/${rootOuId}/${workloadsOuId}/${onceOuId}/ou-x5ev-0xomc641`,
    parentOu: OuName.GOVUKOnce,
  },
  {
    name: OuName.GOVUKOnceKeyManagement,
    displayName: 'GOV.UK Once Key Management',
    id: 'ou-x5ev-fi4n3abq',
    orgPath: `${gdsOrgId}/ou-x5ev-fi4n3abq`,
    orgFullPath: `${gdsOrgId}/${rootOuId}/${workloadsOuId}/${onceOuId}/ou-x5ev-fi4n3abq`,
    parentOu: OuName.GOVUKOnce,
  },
  {
    name: OuName.GOVUKOnceWorkloads,
    displayName: 'GOV.UK Once Workloads',
    id: onceWorkloadsOuId,
    orgPath: `${gdsOrgId}/${onceWorkloadsOuId}`,
    orgFullPath: `${gdsOrgId}/${rootOuId}/${workloadsOuId}/${onceOuId}/${onceWorkloadsOuId}`,
    parentOu: OuName.GOVUKOnce,
  },
  {
    name: OuName.GOVUKOnceDev,
    displayName: 'GOV.UK Once Dev',
    id: 'ou-x5ev-mb83bbup',
    orgPath: `${gdsOrgId}/ou-x5ev-mb83bbup`,
    orgFullPath: `${gdsOrgId}/${rootOuId}/${workloadsOuId}/${onceOuId}/${onceWorkloadsOuId}/ou-x5ev-mb83bbup`,
    parentOu: OuName.GOVUKOnce,
  },
  {
    name: OuName.GOVUKOnceStag,
    displayName: 'GOV.UK Once Staging',
    id: 'ou-x5ev-rumzhus1',
    orgPath: `${gdsOrgId}/ou-x5ev-rumzhus1`,
    orgFullPath: `${gdsOrgId}/${rootOuId}/${workloadsOuId}/${onceOuId}/${onceWorkloadsOuId}/ou-x5ev-rumzhus1`,
    parentOu: OuName.GOVUKOnce,
  },
  {
    name: OuName.GOVUKOnceProd,
    displayName: 'GOV.UK Once Prod',
    id: 'ou-x5ev-ddvqq22p',
    orgPath: `${gdsOrgId}/ou-x5ev-ddvqq22pe`,
    orgFullPath: `${gdsOrgId}/${rootOuId}/${workloadsOuId}/${onceOuId}/${onceWorkloadsOuId}/ou-x5ev-ddvqq22p`,
    parentOu: OuName.GOVUKOnce,
  },
];
