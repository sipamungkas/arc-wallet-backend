const express = require("express");
const router = express.Router();
const notifications = require("../handlers/notifications");
const { authenticateToken } = require("../middlewares/authentication");

router.get("/", authenticateToken, notifications.getNotifications);

module.exports = router;
