const request = require("request");

module.exports = async function GetUsers(req, res) {
    const url = "https://jsonplaceholder.typicode.com/users";
    request(url, (error, response, body) => {
        if (error) throw error;
        res.send(body);
    });
};
