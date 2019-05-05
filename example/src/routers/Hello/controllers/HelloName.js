module.exports = function (req, res) {
    const { firstName, lastName } = req.body;

    res.json({
        hello: `Hello ${firstName} ${lastName}!`
    })
}
