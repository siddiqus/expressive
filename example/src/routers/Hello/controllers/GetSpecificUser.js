const users = [
    {
        name: "Jake",
        age: 28,
        email: "jake@email.com"
    },
    {
        name: "Jill",
        age: 23,
        email: "jill@email.com"
    },
    {
        name: "Jack",
        age: 32,
        email: "jack@email.com"
    }
]

module.exports = async function (req, res) {
    const userId = req.params.userId;
    if (userId > users.length) {
        res.json(null);
    } else {
        res.json(users[userId]);
    }
}