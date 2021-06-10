const { body, query } = require("express-validator");

exports.loginRules = () => [
  body("email")
    .notEmpty()
    .withMessage("Email can not be empty")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Minimum password length is 8"),
];

exports.registerRules = () => [
  body("email")
    .notEmpty()
    .withMessage("Email can not be empty")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail(),
  body("username")
    .isLength({ min: 3 })
    .withMessage("Minimum username length is is 3"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Minimum password length is 8"),
  body("pin").isLength({ max: 6, min: 6 }).withMessage("Invalid Pin"),
];

exports.newPassword = () => [
  query("token").notEmpty().withMessage("Invalid Token"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Minimum password length is 8"),
];
