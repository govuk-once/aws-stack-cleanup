export interface IStackDependency {
  stackName: string;
  lastTouched?: Date;
  status?: string;
  dependsOn: string[];
}
