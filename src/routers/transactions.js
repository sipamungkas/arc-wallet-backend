const express = require("express");
const router = express.Router();

const validator = require("../validators/transaction");
const validate = require("../validators/validate");
const { authenticateToken } = require("../middlewares/authentication");
const transaction = require("../handlers/transactions");

router.get("/receiver", authenticateToken, transaction.getReceiver);
router.post(
  "/",
  authenticateToken,
  validator.createTransaction(),
  validate,
  transaction.createTransaction
);

router.post(
  "/subcription",
  validator.createSubcription(),
  validate,
  transaction.subcription
);

module.exports = router;
