'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');

var Funnel = require('broccoli-funnel');

const { buildWorkers } = require('./lib/worker-build');

module.exports = {
  name: require('./package').name,

  treeForPublic(tree) {
    let buildDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'ember-promise-worker')
    );

    let options = {
      isProduction: true,
      buildDir,
    };

    buildWorkers(options);

    return new Funnel(buildDir, { destDir: 'workers/' });
  },
};
