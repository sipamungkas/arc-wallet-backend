const auth = require("../handlers/auth");
const express = require("express");
const router = express.Router();

const validator = require("../validators/auth");
const validate = require("../validators/validate");
const { authenticateToken } = require("../middlewares/authentication");

router.post("/login", validator.loginRules(), validate, auth.login);
router.post("/register", validator.registerRules(), validate, auth.register);
router.post("/reset-password", auth.resetPassword);
router.post(
  "/new-password",
  validator.newPassword(),
  validate,
  auth.changePassword
);
router.post("/generate-otp", validator.createOTP(), validate, auth.createOTP);
router.post(
  "/otp-verification",
  validator.otpVerification(),
  validate,
  auth.otpVerification
);
router.delete("/logout", authenticateToken, auth.logout);

module.exports = router;
