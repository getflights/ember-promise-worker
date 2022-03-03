import { action } from '@ember/object';
import Service from '@ember/service';

import { PWBHost } from 'promise-worker-bi';

export const WORKERS_PATH = '/workers/';

type WorkerRegistry = { [path: string]: PWBHost };

export default class WorkersService extends Service {
  registry: WorkerRegistry = {}

  @action
  getWorker(name: string): PWBHost {
    const path = WORKERS_PATH + name;

    if (this.registry[path]) return this.registry[path];

    // @ts-ignore
    const hash = window.ASSET_FINGERPRINT_HASH

    const worker = new Worker(`${path}${hash || ''}.js`);
    const promiseWorker = new PWBHost(worker);

    if (!promiseWorker) {
      throw new Error('Failed to create promiseWorker?');
    }

    this.registry[path] = promiseWorker;

    return this.registry[path];
  }

  terminateWorker(worker: PWBHost) {
    (worker._worker as Worker).terminate()
  }

  terminateWorkerByName(name: string) {
    const path = WORKERS_PATH + name;
    this.terminateWorker(this.registry[path])
  }

  willDestroy() {
    Object.values(this.registry).forEach((promiseWorker) => {
      (promiseWorker._worker as Worker).terminate()
    })
  }
}
