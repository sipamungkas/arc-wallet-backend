const { body } = require("express-validator");

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
  body("pin")
    .isNumeric()
    .withMessage("Invalid Pin")
    .bail()
    .isLength({ max: 6, min: 6 })
    .withMessage("Invalid Pin"),
];

exports.newPassword = () => [
  body("email")
    .notEmpty()
    .withMessage("Email can not be empty")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail(),
  body("otp")
    .isString()
    .withMessage("Invalid OTP")
    .bail()
    .isAlphanumeric()
    .withMessage("Invalid OTP")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid OTP"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Minimum password length is 8"),
];

exports.createOTP = () => [
  body("email")
    .notEmpty()
    .withMessage("Email can not be empty")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail(),
];

exports.otpVerification = () => [
  body("email")
    .notEmpty()
    .withMessage("Email can not be empty")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail(),
  body("otp")
    .isString()
    .withMessage("Invalid OTP")
    .bail()
    .isAlphanumeric()
    .withMessage("Invalid OTP")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid OTP"),
];
