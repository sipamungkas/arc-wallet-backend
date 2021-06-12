const user = require("../handlers/user");
const express = require("express");
const { uploadAvatar, errorMulterHandler } = require("../middlewares/multer");
const router = express.Router();

const { authenticateToken } = require("../middlewares/authentication");
router.get("/", authenticateToken, user.getUser);
router.post(
  "/",
  authenticateToken,
  errorMulterHandler(uploadAvatar.single("image")),
  user.updateUser
);

module.exports = router;
