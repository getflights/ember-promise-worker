import Route from "@ember/routing/route";
import { inject } from "@ember/service";
import WorkersService from "ember-promise-worker/services/workers";

export default class ApplicationRoute extends Route {
  @inject workers!: WorkersService;

  async beforeModel() {
    // @ts-ignore
    super.beforeModel(...arguments);

    const workerRes = await this.workers.workerMessage('testworker', 'test2')
    console.log(workerRes)
  }
}
