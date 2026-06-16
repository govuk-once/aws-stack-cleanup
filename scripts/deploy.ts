import { packageLambdas } from './build-lambdas';

packageLambdas().catch((error) => {
  console.error(error);
  process.exit(1);
});
