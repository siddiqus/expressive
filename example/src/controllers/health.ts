import { BaseController } from "../../../src";

export class HealthController extends BaseController {
  async handleRequest() {
    this.ok({
      healthy: true
    })
  }
}