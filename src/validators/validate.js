const { validationResult } = require("express-validator");
const { sendResponse } = require("../helpers/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return sendResponse(res, false, 422, "Validation error", errors.array());
};

module.exports = validate;
