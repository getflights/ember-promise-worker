const Plugin = require('broccoli-plugin');

const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

class BuildWorkers extends Plugin {
  constructor(inputNodes, options = {}) {
    super(inputNodes, {
      annotation: options.annotation,
      // see `options` in the below README to see a full list of constructor options
    });
  }

  build() {
    this.inputPaths.forEach((inputPath) => {
      this._buildWorkers(inputPath);
    });
  }

  _buildWorkers(inputPath) {
    // 1. detect workers
    let workers = {};
    let dir = fs.readdirSync(inputPath);
    dir.forEach((name) => {
      workers[name] = path.join(inputPath, name, 'index.ts'); // Also .js in the future?
    });

    // 2. setup builder
    const workerBuilder = this._configureWorkerBuilder({
      isProduction: true,
      buildDir: this.outputPath,
    });

    // 3. build workers
    Object.entries(workers).map(workerBuilder);
  }

  _configureWorkerBuilder({ isProduction, buildDir }) {
    return ([name, entryPath]) => {
      esbuild.buildSync({
        loader: { '.ts': 'ts' },
        entryPoints: [entryPath],
        bundle: true,
        outfile: path.join(buildDir, `${name}.js`), // {buildDir}/workers/{name}.js
        format: 'esm',
        minify: isProduction,
        sourcemap: !isProduction,
      });
    };
  }
}

module.exports.BuildWorkers = BuildWorkers;
