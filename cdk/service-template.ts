import * as cdk from 'aws-cdk-lib/core';
import { GovUkOnceStack } from './stacks/service-template-stack';
import { getEnvironment, getResourceNamePrefix } from './constants/environment';
import { serviceMetadata } from './constants/environment';

const app = new cdk.App();

new GovUkOnceStack(app, 'ExampleTemplateStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-west-2',
  },
  description: 'Example service template stack',
  stackName: `${getResourceNamePrefix()}-Stack`,
  serviceName: serviceMetadata.serviceName,
  teamName: serviceMetadata.teamName,
  repositoryUrl: serviceMetadata.repositoryUrl,
  version: serviceMetadata.version,
  costCenter: serviceMetadata.costCenter,
  environment: getEnvironment(),
});
