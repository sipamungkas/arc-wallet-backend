const { body } = require("express-validator");
exports.editProfile = () => [
  body("first_name")
    .isLength({ min: 3 })
    .withMessage("Minimum first name length is is 3"),
  body("last_name")
    .isLength({ min: 3 })
    .withMessage("Minimum last name length is is 3"),
  body("old_password")
    .isLength({ min: 8 })
    .withMessage("Minimum new password length is 8"),
  body("new_password")
    .isLength({ min: 8 })
    .withMessage("Minimum new password length is 8"),
  body("old_pin").isLength({ max: 6, min: 6 }).withMessage("Invalid Pin"),
  body("new_pin").isLength({ max: 6, min: 6 }).withMessage("Invalid Pin"),
];
