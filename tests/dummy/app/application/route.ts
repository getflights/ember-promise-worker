import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import WorkersService from 'ember-promise-worker/services/workers';

export default class ApplicationRoute extends Route {
  @service workers!: WorkersService;

  beforeModel() {
    let workers = this.workers;
  }
}
