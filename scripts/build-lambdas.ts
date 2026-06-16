import { build } from 'esbuild';
import * as path from 'node:path';
import * as fs from 'node:fs';

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

const copyFolder = (source: string, destination: string) => {
  fs.cpSync(path.join(__dirname, source), path.join(__dirname, destination), {
    recursive: true,
    force: true,
  });
};

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
