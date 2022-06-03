import { module, skip, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import WorkersService from 'ember-promise-worker/services/workers';

module('Unit | Service | workers', function (hooks) {
  setupTest(hooks);

  test('workers service works', async function (assert) {
    let workers: WorkersService = this.owner.lookup(
      'service:workers'
    ) as WorkersService;

    // Testworker exists in this addon
    let testworker = await workers._getWorker('testworker');
    assert.ok(testworker, 'testworker exists');

    // Worker just returns his messages
    const testMsg = 'testmessage';
    const workerMsg = await workers.workerMessage(
      'testworker',
      // @ts-ignore
      testMsg
    );
    assert.ok(testMsg === workerMsg, 'testworker returns your message');
  });

  test("workers service doesn't find non existing one", async function (assert) {
    let workers: WorkersService = this.owner.lookup(
      'service:workers'
    ) as WorkersService;
    assert.ok(workers, 'workers service was found');

    let hasInitErrors = await workers
      ._getWorker('zkHlELpdsqRsAXAL6u9q')
      .then(() => {
        return false;
      })
      .catch(() => {
        return true;
      });

    assert.ok(hasInitErrors, 'getWorker throws an error');

    let hasMessageErrors = await workers
      .workerMessage(
        'zkHlELpdsqRsAXAL6u9q',
        // @ts-ignore
        'this shouldnt work'
      )
      .then(() => {
        return false;
      })
      .catch(() => {
        return true;
      });

    assert.ok(hasMessageErrors, 'workerMessage throws an error');
  });

  test("worker answers to the correct source (hash)", async function (assert) {
    let workers: WorkersService = this.owner.lookup(
      'service:workers'
    ) as WorkersService;
    assert.ok(workers, 'workers service was found');

    const workerMessage1 = await workers.workerMessage(
      'testworker',
      // @ts-ignore
      'a'
    );

    const workerMessage2 = await workers.workerMessage(
      'testworker',
      // @ts-ignore
      'b'
    );

    console.log(workerMessage1)
    console.log(workerMessage2)
  });
});
