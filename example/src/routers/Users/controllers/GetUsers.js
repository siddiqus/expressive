const unirest = require("unirest");

module.exports = async function GetUsers(req, res) {
    const url = "https://jsonplaceholder.typicode.com/users";
    unirest.get(url).end((response) => {
        res.send(response.body);
    });
}
