ember-promise-worker
==============================================================================

An addon to work with promise-worker-bi in Ember


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v12 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-promise-worker
```


Usage
------------------------------------------------------------------------------

With ember-promise-worker, you can use web workers in your Ember project.

Develop your worker in ```/app/workers/{name}/index.ts``` and talk to them in the WorkersService using getWorker('name') and postMessage().

Also check out promise-worker-bi for more information about the workers properties, methods: https://www.npmjs.com/package/promise-worker-bi

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
