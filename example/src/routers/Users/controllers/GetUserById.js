const unirest = require("unirest");

module.exports = async function GetUserById(req, res) {
    const { userId } = req.params;
    const url = `https://jsonplaceholder.typicode.com/users/${userId}`;
    unirest.get(url).end((response) => {
        res.send(response.body);
    });
};
