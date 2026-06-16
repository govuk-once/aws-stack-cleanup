import { OuName } from '../models/ous/OuName';
import { allOus, gdsOrgId, rootOuId } from './ous';

describe('ous', () => {
  it('contains the root OU with the expected identifiers', () => {
    const rootOu = allOus.find((ou) => ou.name === OuName.Root);

    expect(rootOu).toBeDefined();
    if (!rootOu) return;

    expect(rootOu.displayName).toEqual('root');
    expect(rootOu.id).toEqual(rootOuId);
    expect(rootOu.orgPath).toEqual(`${gdsOrgId}/${rootOuId}`);
    expect(rootOu.orgFullPath).toEqual(`${gdsOrgId}/${rootOuId}`);
    expect(rootOu.parentOu).toBeUndefined();
  });

  // it("contains transition and GOV.UK Once OUs with correct hierarchy", () => {
  //   const transitionOu = allOus.find((ou) => ou.name === OuName.Transition);
  //   const onceOu = allOus.find((ou) => ou.name === OuName.GOVUKOnce);

  //   expect(transitionOu).toBeDefined();
  //   expect(onceOu).toBeDefined();
  //   if (!transitionOu || !onceOu) return;

  //   expect(transitionOu.id).toEqual(transitionOuId);
  //   expect(transitionOu.parentOu).toEqual(OuName.Root);
  //   expect(transitionOu.orgFullPath).toEqual(`${gdsOrgId}/${rootOuId}/${transitionOuId}`);

  //   expect(onceOu.id).toEqual(onceOuId);
  //   expect(onceOu.parentOu).toEqual(OuName.Transition);
  //   expect(onceOu.orgFullPath).toEqual(`${gdsOrgId}/${rootOuId}/${transitionOuId}/${onceOuId}`);
  // });

  // it("contains the GOV.UK Once Workloads OU in the expected location", () => {
  //   const workloadsOu = allOus.find((ou) => ou.name === OuName.GOVUKOnceWorkloads);

  //   expect(workloadsOu).toBeDefined();
  //   if (!workloadsOu) return;

  //   expect(workloadsOu.id).toEqual(onceWorkloadsOuId);
  //   expect(workloadsOu.displayName).toEqual("GOV.UK Once Workloads");
  //   expect(workloadsOu.parentOu).toEqual(OuName.GOVUKOnce);
  //   expect(workloadsOu.orgPath).toEqual(`${gdsOrgId}/${onceWorkloadsOuId}`);
  //   expect(workloadsOu.orgFullPath).toEqual(`${gdsOrgId}/${rootOuId}/${transitionOuId}/${onceOuId}/${onceWorkloadsOuId}`);
  // });

  // it("builds consistent paths for every OU entry", () => {
  //   expect(allOus.length).toBeGreaterThan(0);

  //   for (const ou of allOus) {
  //     expect(ou.orgPath).toEqual(`${gdsOrgId}/${ou.id}`);
  //     expect(ou.orgFullPath.startsWith(`${gdsOrgId}/${rootOuId}`)).toBe(true);
  //     expect(ou.orgFullPath.endsWith(ou.id)).toBe(true);
  //   }
  // });
});
