const auth = require("../handlers/auth");
const express = require("express");
const router = express.Router();

const { loginRules, registerRules } = require("../validators/users");
const validate = require("../validators/validate");

router.post("/login", loginRules(), validate, auth.login);
router.post("/register", registerRules(), validate, auth.register);
router.post("/reset-password", auth.resetPassword);

module.exports = router;
