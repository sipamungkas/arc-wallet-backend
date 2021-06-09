const { check } = require("express-validator");

exports.loginRules = () => [
  check("email")
    .notEmpty()
    .withMessage("Email can not be empty")
    .bail()
    .isEmail()
    .withMessage("Invalid email format"),
  check("password").isLength({ min: 8 }).withMessage("Password length min 8"),
];
