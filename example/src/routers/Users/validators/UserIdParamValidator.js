const { param } = require("express-validator");

module.exports = [
    param('userId')
        .exists().withMessage("Must provide userId")
        .isInt({ min: 1 }).withMessage("userId must be a positive integer"),
]
