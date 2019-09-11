const { BaseController } = require("../../../../expressive");

module.exports = class HelloController extends BaseController {
    handleRequest(req, res, next) {
        res.json({
            hello: "world"
        })
    }
}
