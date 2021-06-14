const { body, query } = require("express-validator");

exports.createTransaction = () => [
  body("amount")
    .isFloat({ min: 10000, max: 10000000 })
    .withMessage("Amount must be a number between 1.000 - 10.000.000")
    .bail(),
  body("type_id").isNumeric().isIn([1, 2]).withMessage("Invalid Type Id"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
  body("pin")
    .isNumeric()
    .withMessage("Invalid Pin")
    .bail()
    .isLength({ max: 6, min: 6 })
    .withMessage("Invalid Pin"),
];

exports.createSubcription = () => [
  body("user_id")
    .notEmpty()
    .withMessage("Invalid User ID")
    .bail()
    .isNumeric()
    .withMessage("Invalid User ID")
    .bail(),
  body("amount")
    .isFloat({ min: 10000, max: 10000000 })
    .withMessage("Amount must be a number between 1.000 - 10.000.000")
    .bail(),
  body("type_id").isInt({ max: 3, min: 3 }).withMessage("Invalid Type Id"),
  body("notes")
    .notEmpty()
    .withMessage("Notes Can not be empty")
    .bail()
    .isString()
    .withMessage("Notes must be a string")
    .bail()
    .isIn([
      "Spotify",
      "Netflix",
      "Youtube Premium",
      "Disney +",
      "Amazon Prime",
    ]),
];

exports.allTransaction = () => [];
