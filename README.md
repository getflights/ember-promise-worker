# ember-promise-worker

[Short description of the addon.]


## Compatibility

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v12 or above


## Installation

```
ember install ember-promise-worker
```


## Usage
With ember-promise-worker, you can use web workers in your Ember project.

Develop your worker in ```<project_root>/workers/{name}/index.ts``` and talk to them using the WorkersService.

### Writing the worker code
workers/**example**/index.ts
```js
import EPWorker from 'ember-promise-worker/objects/EPWorker';

const worker = new EPWorker();

worker.register((message) => {
  // Can also be async ^
  if (message.action === "DESERIALIZE") {
    // do something
    return result;
  } else {
    throw new Error("Unknown action")
  }
})
```

### Talking to the worker
```js
import WorkersService, { EPWorkerMessage } from "ember-promise-worker/services/workers";

// 1. Inject the 'workers' service

const WORKER_NAME = "example";
const action = "DESERIALIZE"; // string
const args = { myData: 1 } // any
//   transferables?: Transferable[]

const message: EPWorkerMessage = { action, args, transferables }
const response = await this.workers.workerMessage(WORKER_NAME, message)
```

## Contributing
See the [Contributing](CONTRIBUTING.md) guide for details.


## License
This project is licensed under the [MIT License](LICENSE.md).
-
