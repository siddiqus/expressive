const { BaseController } = require("../../../../expressive");

module.exports = class HelloNameController extends BaseController {
    handleRequest(req, res, next) {
        const { firstName, lastName } = req.body;

        res.json({
            hello: `Hello ${firstName} ${lastName}!`
        })
    }
}
