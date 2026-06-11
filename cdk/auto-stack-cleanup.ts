import * as cdk from 'aws-cdk-lib/core';
import { AutoStackCleanupStack } from './stacks/auto-stack-cleanup-stack';
import { serviceMetadata } from './constants/environment';
import { ServiceEnvironmentNamingProvider } from 'once-platform-constructs/namingProviders';
const app = new cdk.App();

const namingProvider = new ServiceEnvironmentNamingProvider(
  serviceMetadata.serviceName,
);

new AutoStackCleanupStack(app, 'CDKConstructsDemoStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-west-2',
  },
  description: 'Example GDS Constructs stack',
  stackName: `${namingProvider.getResourceName('stack')}`,
  serviceName: serviceMetadata.serviceName,
  teamName: serviceMetadata.teamName,
  repositoryUrl: serviceMetadata.repositoryUrl,
  version: serviceMetadata.version,
  costCenter: serviceMetadata.costCenter,
  environment: namingProvider.getEnvironment(),
});
