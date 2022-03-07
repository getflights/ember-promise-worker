import Service from '@ember/service';

import { PWBHost } from 'promise-worker-bi';

export const WORKERS_PATH = '/workers/'; // --> dist/workers

type WorkerRegistry = { [path: string]: PWBHost };

export default class WorkersService extends Service {
  registry: WorkerRegistry = {};

  async getWorker(name: string): Promise<PWBHost> {
    const path = WORKERS_PATH + name;

    // --> If this worker already exists, return the instance
    if (this.registry[path]) {
      return this.registry[path];
    }

    // 1. Find the worker
    // @ts-ignore
    const hash = window.ASSET_FINGERPRINT_HASH;
    const workerPath = `${path}${hash || ''}.js`

    // TODO: Error or something on 404
    await fetch(workerPath).then(r => {
      if (!r.ok) throw new Error('Worker could not be found')
    }).catch((e) => {throw e})

    const worker = new Worker(workerPath);

    const promiseWorker = new PWBHost(worker);

    if (!promiseWorker) {
      throw new Error('Failed to create promiseWorker');
    }

    // 2. Register the worker
    this.registry[path] = promiseWorker;

    // 3. Return the worker
    return this.registry[path];
  }

  terminateWorker(worker: PWBHost) {
    (worker._worker as Worker).terminate();
  }

  terminateWorkerByName(name: string) {
    const path = WORKERS_PATH + name;
    this.terminateWorker(this.registry[path]);
  }

  willDestroy() {
    Object.values(this.registry).forEach((promiseWorker) => {
      (promiseWorker._worker as Worker).terminate();
    });
  }
}
