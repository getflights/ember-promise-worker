import Service from '@ember/service';

export const WORKERS_PATH = '/workers/'; // --> dist/workers

type WorkerRegistry = { [path: string]: Worker };

export default class WorkersService extends Service {
  registry: WorkerRegistry = {};

  workerMessage(workerName: string, message: any) {
    return new Promise(async (resolve) => {
      const worker: Worker = await this.getWorker(workerName)

      // We don't really need MessageChannel
      // const messageChannel = new MessageChannel()

      // messageChannel.port1.onmessage = (e) => {
      //   resolve(e.data);
      // }

      worker.onmessage = ((e) => {
        resolve(e.data)
      })

      worker.postMessage(message, /* [messageChannel.port2] */)
    })
  }

  async getWorker(name: string): Promise<Worker> {
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

    // 2. Register the worker
    this.registry[path] = worker;

    // 3. Return the worker
    return this.registry[path];
  }

  // terminateWorker(worker: Worker) {
  //   worker.terminate();
  // }

  terminateWorkerByName(name: string) {
    const path = WORKERS_PATH + name;
    this.registry[path].terminate();
  }

  willDestroy() {
    Object.values(this.registry).forEach((worker) => {
      worker.terminate();
    });
  }
}
