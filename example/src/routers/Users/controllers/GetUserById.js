const request = require("request");

module.exports = async function GetUserById(req, res) {
    const { userId } = req.params;
    const url = `https://jsonplaceholder.typicode.com/users/${userId}`;
    request(url, (error, response, body) => {
        if (error) throw error;
        res.send(body);
    });
};
