const { BaseController } = require("../../../../expressive");

module.exports = class RootGetController extends BaseController {
    handleRequest(req, res, next) {
        res.json({
            message: "This is the API root."
        })
    }
}
