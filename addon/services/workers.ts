import Service from '@ember/service';
import { resolveAsset } from 'ember-promise-worker/utils/resolveAsset';

const WORKERS_PATH = 'workers/'; // --> dist/workers
const WORKER_MESSAGE_TIMEOUT = 30000;
const WORKER_INIT_TIMEOUT = 2000;

type WorkerRegistry = { [name: string]: Worker };

export interface EPWorkerMessage {
  action: string;
  args: any;
  transferables?: Transferable[];
}

export default class WorkersService extends Service {
  registry: WorkerRegistry = {};

  // Optional: look into Threads.js / comlink / promise-worker / ...
  workerMessage(workerName: string, message: EPWorkerMessage) {
    return new Promise(async (resolve, reject) => {
      this._getWorker(workerName)
        .then((worker) => {
          const messageChannel = new MessageChannel();

          // Listen to 'message' responses from the worker, then resolve
          const messageFromWorker = (e: MessageEvent) => {
            if (e.data.error) {
              reject(e.data.error);
            }
            resolve(e.data);
            // Stop listening to the worker, it has been resolved
            worker.removeEventListener('message', messageFromWorker);
          };

          messageChannel.port1.onmessage = messageFromWorker;

          // Don't freeze, add a timeout?
          setTimeout(() => {
            reject(`Worker (${workerName}) took to long to respond.`);
          }, WORKER_MESSAGE_TIMEOUT);

          // Communicate with worker
          if (message.transferables) {
            worker.postMessage(message, [
              messageChannel.port2,
              ...message.transferables,
            ]);
          } else {
            worker.postMessage(message, [messageChannel.port2]);
          }
        })
        .catch(() => {
          reject('Error trying to find the worker.');
        });
    });
  }

  _isTransferable(object: any) {
    console.log(object.prototype.toString());
    switch (object.prototype.toString()) {
    }
    return false;
  }

  async _getWorker(name: string): Promise<Worker> {
    return new Promise(async (resolve, reject) => {
      // --> If this worker already exists, return the instance
      if (this.registry[name]) {
        resolve(this.registry[name]);
      }

      const path = WORKERS_PATH + name + '.js';

      // 1. Find the worker
      // const workerPath = await resolveAsset(path)
      let workerPath = await resolveAsset(path);

      if (!workerPath) {
        reject('Worker path could not be resolved.');
        return;
      }

      if (!workerPath.startsWith('/')) {
        workerPath = '/' + workerPath;
      }

      const worker = new Worker(workerPath);

      // Resolve worker's "registered" message
      const workerRegistered = (e: MessageEvent) => {
        if (e.data.registered) {
          // console.log(`Worker (${name}) was succesfully registered`)

          // Add the worker to the registry
          this.registry[name] = worker;

          // Return the worker
          resolve(this.registry[name]);
        } else {
          reject(
            `Worker (${name}) did not answer with { registered: true }, is it an EPWorker?`
          );
        }

        // Stop listening to the worker, the promise was handled
        removeWorkerListeners();
      };

      // Listen to worker messages
      function workerListener(e: MessageEvent) {
        workerRegistered(e);
      }

      worker.addEventListener('message', workerListener);

      // Listen to worker errors
      function workerErrorListener() {
        reject(`Worker (${name}) could not be initialized.`);
        // Stop listening to the worker, the promise was handled
        removeWorkerListeners();
      }

      worker.addEventListener('error', workerErrorListener);

      // Function to help w removing listeners
      function removeWorkerListeners() {
        worker.removeEventListener('message', workerListener);
        worker.removeEventListener('error', workerErrorListener);
      }

      setTimeout(() => {
        reject(`Worker (${name}) took to long to respond. Is it an EPWorker?`);
      }, WORKER_INIT_TIMEOUT);
    });
  }

  terminateWorkerByName(name: string) {
    this.registry[name].terminate();
    delete this.registry[name];
  }

  willDestroy() {
    Object.values(this.registry).forEach((worker) => {
      worker.terminate();
    });
  }
}
