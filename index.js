'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');

const esbuild = require('esbuild');

const { WatchedDir } = require('broccoli-source');
var mergeTrees = require('broccoli-merge-trees');
const { Funnel } = require('broccoli-funnel');
const { BuildWorkers } = require('./broccoli-plugins/build-workers');


module.exports = {
  name: require('./package').name,

  included(app) {
    this.appRoot = path.join(app.project.root);
    this.workersDir = path.join(this.appRoot, 'workers');
  },

  treeForPublic() {
    let trees = [];

    // if (type == 'all') {
      if (fs.existsSync(this.workersDir)) {
        // 1. Watch workers dir
        let workerTree = new WatchedDir(this.workersDir);

        // 2. Do something witht his tree > name/index.ts to name.js
        workerTree = new BuildWorkers([workerTree])

        // 3. Make it output to dist/workers
        workerTree = new Funnel(workerTree, { destDir: 'workers' })
        trees.push(workerTree)
      }
    // }

    return mergeTrees(trees, { overwrite: true });
  },

  _buildWorkers() {
    // 1. detect workers
    let workers = {};
    let dir = fs.readdirSync(this.workersDir);
    dir.forEach((name) => {
      workers[name] = path.join(this.workersDir, name, 'index.ts'); // Also .js in the future?
    });

    // 2. setup builder
    const workerBuilder = this._configureWorkerBuilder({
      isProduction: true,
      buildDir: this.workerTempDir,
    });

    // 3. build workers
    Object.entries(workers).map(workerBuilder);
  },

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
        tsconfig: path.join(this.appRoot, 'tsconfig.json'),
      });
    };
  },
};
