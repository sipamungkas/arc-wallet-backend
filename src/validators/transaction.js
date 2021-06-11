const { body } = require("express-validator");

exports.createTransaction = () => [
  body("amount")
    .isFloat({ min: 10000, max: 10000000 })
    .withMessage("Amount must be a number between 1.000 - 10.000.000")
    .bail(),
  body("type_id").isNumeric().isIn([1, 2, 3]).withMessage("Invalid Type Id"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
];
