const { BaseController } = require("../../../../expressive");

module.exports = class HelloNameController extends BaseController {
    handleRequest() {
        const { firstName, lastName } = this.req.body;

        this.ok({
            hello: `Hello ${firstName} ${lastName}!`
        });
    }
}
