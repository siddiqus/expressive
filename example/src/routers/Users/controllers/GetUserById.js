const { BaseController } = require("../../../../expressive");

module.exports = class GetUserById extends BaseController {
    constructor(request) {
        super();
        this.request = request;
    }

    async handleRequest() {
        const { userId } = this.req.params;
        const url = `https://jsonplaceholder.typicode.com/users/${userId}`;

        this.request.get({ url, json: true }, (err, response, body) => {
            if (err) throw err;
            return this.ok(body);
        });
    }
}
