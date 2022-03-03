'use strict';

const path = require('path');
const fs = require('fs');

const esbuild = require('esbuild');

const cwd = process.cwd();
const workerRoot = path.join(cwd, 'workers');

const detectWorkers = () => {
  let workers = {};
  let dir = fs.readdirSync(workerRoot);

  for (let i = 0; i < dir.length; i++) {
    let name = dir[i];

    workers[name] = path.join(workerRoot, name, 'index.ts');
  }

  return workers;
};

const configureWorkerTree = ({ isProduction, buildDir }) => {
  return ([name, entryPath]) => {
    esbuild.buildSync({
      loader: { '.ts': 'ts' },
      entryPoints: [entryPath],
      bundle: true,
      outfile: path.join(buildDir, `${name}.js`), // {buildDir}/workers/{name}.js
      format: 'esm',
      minify: isProduction,
      sourcemap: !isProduction,
      tsconfig: path.join(cwd, 'tsconfig.json'),
    });
  };
};

module.exports = {
  buildWorkers(options) {
    let inputs = detectWorkers();
    let workerBuilder = configureWorkerTree(options);

    Object.entries(inputs).map(workerBuilder);
  },
};
