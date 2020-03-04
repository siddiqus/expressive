import { BaseController } from "../../../../src";

export class PostHello extends BaseController {
    handleRequest() {
        const name = this.req.body.name;

        return this.ok({
            message: `Hello, ${name}`
        })
    }
}
