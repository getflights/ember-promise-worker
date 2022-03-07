import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import WorkersService from 'ember-promise-worker/services/workers';

module('Unit | Service | workers', function(hooks) {
  setupTest(hooks);

  test('workers service works', async function(assert) {
    // @ts-ignore
    let service: WorkersService = this.owner.lookup('service:workers');
    assert.ok(true)

    // Testworker exists in this addon
    let testworker = await service.getWorker('testworker')
    assert.ok(testworker)

    // Worker just returns his messages
    const testMsg = "testmessage"
    const workerMsg = await testworker.postMessage(testMsg)
    assert.ok(testMsg == workerMsg)
  })

  test('workers service doesn\'t find non existing one', async function(assert) {
    // @ts-ignore
    let service: WorkersService = this.owner.lookup('service:workers');
    assert.ok(service)

    let hasErrors = await service.getWorker('zkHlELpdsqRsAXAL6u9q').then(() => {
      return false
    }).catch(() => {
      return true
    })
    assert.ok(hasErrors)
  })
});

