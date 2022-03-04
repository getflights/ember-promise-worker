import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import WorkersService from 'ember-promise-worker/services/workers';

module('Unit | Service | workers', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('workers service works', function(assert) {
    // @ts-ignore
    let service: WorkersService = this.owner.lookup('service:workers');
    assert.ok(true);
  });
});

