import { build } from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type LambdaBuild = {
  source: string;
  destination: string;
};

const nodeLambdas: LambdaBuild[] = [
  {
    source: '../src/detectStaleStacks/index.ts',
    destination: '../dist/detectStaleStacks',
  },
  {
    source: '../src/staleStackDeletion/index.ts',
    destination: '../dist/staleStackDeletion',
  },
];

export const packageLambdas = async () => {
  console.log(`building lambdas`);

  for (const lambda of nodeLambdas) {
    const entry = path.join(__dirname, lambda.source);
    const destination = path.join(__dirname, lambda.destination);

    if (!fs.existsSync(entry)) {
      throw new Error(`Entry not frond ${entry}`);
    }

    await build({
      entryPoints: [entry],
      bundle: true,
      platform: 'node',
      target: 'node24',
      outdir: destination,
      sourcemap: false,
      minify: false,
    });

    console.log(`built: ${lambda.destination}`);
  }

  console.log('all lambdas built');
};
