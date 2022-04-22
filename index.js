'use strict';

const path = require('path');
const fs = require('fs');

const { WatchedDir } = require('broccoli-source');
var mergeTrees = require('broccoli-merge-trees');
const { Funnel } = require('broccoli-funnel');
const { BuildWorkers } = require('./broccoli-plugins/build-workers');

module.exports = {
  name: require('./package').name,

  treeForPublic() {
    const workersDir = path.join(this.parent.root, 'workers');
    console.log(workersDir)

    debugger

    let trees = [];

    if (fs.existsSync(workersDir)) {
      // 1. Watch workers dir
      let workerTree = new WatchedDir(workersDir);

      // 2. Do something witht his tree > name/index.ts to name.js
      workerTree = new BuildWorkers([workerTree]);

      // 3. Make it output to dist/workers
      workerTree = new Funnel(workerTree, { destDir: 'workers' });
      trees.push(workerTree);
    }

    return mergeTrees(trees, { overwrite: true });
  }
};
