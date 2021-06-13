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
router.get("/phone-number", authenticateToken, user.getPhoneNumber);
router.post("/phone-number", authenticateToken, user.addPhoneNumber);
router.patch(
  "/phone-number/:idContact",
  authenticateToken,
  user.updatePhoneNumber
);
router.delete(
  "/phone-number/:idContact",
  authenticateToken,
  user.deletePhoneNumber
);

module.exports = router;
