const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middlewares/authentication");
const transaction = require("../handlers/transactions");

router.get("/receiver", authenticateToken, transaction.getReceiver);

module.exports = router;
