const { expressValidator } = require("../../../../expressive");
const { body } = expressValidator;

module.exports = [
    body("firstName")
        .exists().withMessage("Must provide 'firstName' parameter.")
        .not().isEmpty().withMessage("'firstName' parameter must not be empty")
        .isString().withMessage("'firstName' parameter must be a string"),

    body("lastName")
        .exists().withMessage("Must provide 'lastName' parameter.")
        .not().isEmpty().withMessage("'lastName' parameter must not be empty")
        .isString().withMessage("'lastName' parameter must be a string"),
];
