import Service from '@ember/service';

export const WORKERS_PATH = '/workers/'; // --> dist/workers
const WORKER_MESSAGE_TIMEOUT = 30000;
const WORKER_INIT_TIMEOUT = 2000;

type WorkerRegistry = { [path: string]: Worker };

export default class WorkersService extends Service {
  registry: WorkerRegistry = {};

  // Optional: look into Threads.js / comlink / promise-worker / ...
  workerMessage(workerName: string, message: Object) {
    return new Promise(async (resolve, reject) => {
      this._getWorker(workerName)
        .then((worker) => {
          // Listen to 'message' responses from the worker, then resolve
          const messageFromWorker = (e: MessageEvent) => {
            resolve(e.data)
            // Stop listening to the worker, it has been resolved
            worker.removeEventListener('message', messageFromWorker)
          }

          worker.addEventListener('message', messageFromWorker)

          // Listen to 'error' responses from the worker, and reject
          const errorFromWorker = (e: ErrorEvent) => {
            e.preventDefault()
            reject(e)
          }

          worker.addEventListener('error', errorFromWorker)

          // Don't freeze, add a timeout?
          setTimeout(() => {
            reject(`Worker (${workerName}) took to long to respond.`)
          }, WORKER_MESSAGE_TIMEOUT)

          // Communicate with worker
          worker.postMessage(message) // We don't need MessageChannel (for now?)
        })
        .catch(() => {
          reject("Error trying to find the worker.")
        })
    })
  }

  async _getWorker(name: string): Promise<Worker> {
    return new Promise((resolve, reject) => {
      const path = WORKERS_PATH + name;

      // --> If this worker already exists, return the instance
      if (this.registry[path]) {
        resolve(this.registry[path]);
      }

      // 1. Find the worker
      // @ts-ignore
      const hash = window.ASSET_FINGERPRINT_HASH;
      const workerPath = `${path}${hash || ''}.js`

      const worker = new Worker(workerPath);

      // Resolve worker's "registered" message
      const workerRegistered = (e: MessageEvent) => {
        if (e.data.registered) {
          // console.log(`Worker (${name}) was succesfully registered`)

          // Add the worker to the registry
          this.registry[path] = worker;

          // Return the worker
          resolve(this.registry[path]);
        } else {
          reject(`Worker (${name}) did not answer with { registered: true }, is it an EPWorker?`)
        }

        // Stop listening to the worker, the promise was handled
        removeWorkerListeners()
      }

      // Listen to worker messages
      function workerListener (e: MessageEvent) {
        workerRegistered(e)
      }

      worker.addEventListener('message', workerListener)

      // Listen to worker errors
      function workerErrorListener() {
        reject(`Worker (${name}) could not be initialized.`)
        // Stop listening to the worker, the promise was handled
        removeWorkerListeners()
      }

      worker.addEventListener('error', workerErrorListener)

      // Function to help w removing listeners
      function removeWorkerListeners() {
        worker.removeEventListener('message', workerListener)
        worker.removeEventListener('error', workerErrorListener)
      }

      setTimeout(() => {
        reject(`Worker (${name}) took to long to respond. Is it an EPWorker?`)
      }, WORKER_INIT_TIMEOUT)
    })
  }

  // terminateWorker(worker: Worker) {
  //   worker.terminate();
  //   const path = worker
  //   delete this.registry[worker]
  // }

  terminateWorkerByName(name: string) {
    const path = WORKERS_PATH + name;
    this.registry[path].terminate();
    delete this.registry[path];
  }

  willDestroy() {
    Object.values(this.registry).forEach((worker) => {
      worker.terminate();
    });
  }
}
