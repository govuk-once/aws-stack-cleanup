// Exported for use by other services in the platform
export { FactoryBase } from './FactoryBase.js';
export {
  LambdaFactory,
  ILambdaProperties,
  IEnvironmentVariable,
} from './LambdaFactory.js';
export { RoleHelper, CrudOperations, IRoleHelperProps } from './RoleHelper.js';

// Note: ServiceParameters, NullNamingProvider, ILambdaRoute are defined but not used in this service.
// They remain in lib/ for potential future use by consuming services.
