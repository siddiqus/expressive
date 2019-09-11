const request = require("request");
const util = require("util");
const requestPromise = util.promisify(request);

const { BaseController } = require("../../../../expressive");

module.exports = class GetUserById extends BaseController {
    constructor() {
        super();
        this.request = request;
    }

    async handleRequest(req, res, next) {
        const { userId } = req.params;
        const url = `https://jsonplaceholder.typicode.com/users/${userId}`;
        
        const { error, body } = await requestPromise(url);
        if (error) throw error;
        res.send(body);
    }
}
