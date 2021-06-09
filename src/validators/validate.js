const { validationResult } = require("express-validator");
const { validationFormatter } = require("../helpers/errors");

const { sendResponse } = require("../helpers/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors
    .array()
    .map((err) => validationFormatter(err.param, err.msg));

  return sendResponse(res, false, 422, "Validation error", extractedErrors);
};

module.exports = validate;
