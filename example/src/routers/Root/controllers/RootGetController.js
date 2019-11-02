const { BaseController } = require("../../../../expressive");

module.exports = class RootGetController extends BaseController {
    handleRequest() {
        return this.ok({
            message: "This is the API root."
        });
    }
}
