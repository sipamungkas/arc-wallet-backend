const user = require("../handlers/user");
const express = require("express");
const { uploadAvatar, errorMulterHandler } = require("../middlewares/multer");
const router = express.Router();

const { authenticateToken } = require("../middlewares/authentication");
router.get("/", authenticateToken, user.getUser);
router.patch(
  "/",
  authenticateToken,
  errorMulterHandler(uploadAvatar.single("image")),
  user.updateUser
);
router.get("/phoneNumber", authenticateToken, user.getPhoneNumber);
router.post("/phoneNumber", authenticateToken, user.addPhoneNumber);
router.patch(
  "/phoneNumber/:idContact",
  authenticateToken,
  user.updatePhoneNumber
);
router.delete(
  "/phoneNumber/:idContact",
  authenticateToken,
  user.deletePhoneNumber
);

module.exports = router;
