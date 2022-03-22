import Service from '@ember/service';

export const WORKERS_PATH = '/workers/'; // --> dist/workers

type WorkerRegistry = { [path: string]: Worker };

export default class WorkersService extends Service {
  registry: WorkerRegistry = {};

  workerMessage(workerName: string, message: Object) {
    return new Promise(async (resolve, reject) => {
      const worker: Worker = await this.getWorker(workerName)

      // Worker has responded > resolve
      const messageFromWorker = (e: MessageEvent) => {
        resolve(e.data)
        // Stop listening to the worker, it has been resolved
        worker.removeEventListener('message', messageFromWorker)
      }

      worker.addEventListener('message', messageFromWorker)

      // How to avoid getting no response and thus freezing the application

      // Don't freeze on worker errors
      const errorFromWorker = (e: ErrorEvent) => {
        e.preventDefault()
        reject(e)
      }

      worker.addEventListener('error', errorFromWorker)

      worker.postMessage(message) // We don't need MessageChannel (for now?)
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
    const worker = new Worker(workerPath);

    console.log(name, worker)

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
