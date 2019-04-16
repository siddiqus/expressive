const unirest = require("unirest");

module.exports = async function (req, res) {
    const userId = req.params.userId;
    const url = `https://jsonplaceholder.typicode.com/users/${userId}`;
    unirest.get(url).end(response => {
        res.send(response.body);
    });
}