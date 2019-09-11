const util = require("util");
const request = util.promisify(require("request"));
const { BaseController } = require("../../../../expressive");

module.exports = class GetUsers extends BaseController {
    constructor() {
        super();
        this.request = request;
    }

    async handleRequest(req, res, next) {
        const url = "https://jsonplaceholder.typicode.com/users";
        const { error, response, body } = await request(url);
        if (error) throw error;
        res.send(body);
    }
}
