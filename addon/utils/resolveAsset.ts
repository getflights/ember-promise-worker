import DEBUG from '@glimmer/env';

interface AssetMap {
  loaded: boolean;
  assets: {
    [key: string]: string;
  } | null;
  prepend: string | null;
  enabled: boolean | null;
}

let assetMap: AssetMap = {
  loaded: false,
  assets: null,
  prepend: null,
  enabled: null,
};

// More errors like checking the config
// https://github.com/buschtoens/ember-cli-resolve-asset

let promise: Promise<AssetMap>;

export function loadAssetMap() {
  if (promise) {
    return promise;
  }
  promise = _fetchAssetMap();
  return promise;
}

async function _fetchAssetMap(): Promise<AssetMap> {
  // const assetMapPath = ;

  // if (assetMapPath) {
  assetMap.enabled = true;
  assetMap = await fetch('/assets/assetMap.json')
    .then((r) => r.json())
    .catch(() => {
      // if (DEBUG) {
      //   throw new Error('Asset map not found');
      // }
      assetMap.enabled = false;
    });
  // } else {
  //   assetMap.enabled = false;
  // }

  return assetMap;
}

export const resolveAsset = async (path: string) => {
  if (!assetMap.assets) {
    await loadAssetMap();
  }

  if (assetMap.enabled === false) {
    return path;
  }

  path = path.replace(/^\//g, ''); // remove leading '/' just in case

  if (!assetMap.assets![path]) {
    if (DEBUG) {
      throw new Error(`Asset '${path}' was not found in the asset map.`);
    }
  }

  return assetMap.assets![path];
};
