import DEBUG from '@glimmer/env';

let assetMap: {
  assets: {
    [key: string]: string;
  };
  prepend: string;
};

// More errors like checking the config
// https://github.com/buschtoens/ember-cli-resolve-asset

export const resolveAsset = async (path: string) => {
  // fetch asset map
  if (!assetMap) {
    assetMap = await fetch('/assets/assetMap.json')
      .then((r) => r.json())
      .catch(() => {
        if (DEBUG) {
          throw new Error('Asset map not found')
        }
      });
  }

  path = path.replace(/^\//g, "") // remove leading '/' just in case

  return assetMap.assets[path];
};
