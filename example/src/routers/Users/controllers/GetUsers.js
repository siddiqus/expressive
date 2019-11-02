const { BaseController } = require("../../../../expressive");

module.exports = class GetUsers extends BaseController {
    constructor(request) {
        super();
        this.request = request;
    }

    async handleRequest() {
        const url = "https://jsonplaceholder.typicode.com/users";
        this.request.get({ url, json: true }, (err, response, body) => {
            if (err) throw err;
            return this.ok(body);
        });
    }
}
