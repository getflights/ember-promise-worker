'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');

const esbuild = require('esbuild');

var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: require('./package').name,

  included(app) {
    this.appRoot = path.join(app.project.root);
    this.workerRoot = path.join(this.appRoot, 'app', 'workers')
  },

  treeForPublic() {
    const workers = this._detectWorkers();

    const buildDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ember-promise-worker-'));

    let options = {
      isProduction: true,
      buildDir,
    };

    let workerBuilder = this._configureWorkerBuilder(options);

    Object.entries(workers).map(workerBuilder);

    return new Funnel(buildDir, { destDir: 'workers' })
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

  _detectWorkers() {
    let workers = {};
    let dir = fs.readdirSync(this.workerRoot);

    for (let i = 0; i < dir.length; i++) {
      let name = dir[i];

      workers[name] = path.join(this.workerRoot, name, 'index.ts');
    }

    return workers;
  }
};
