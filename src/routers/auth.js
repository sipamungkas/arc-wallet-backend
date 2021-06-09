const auth = require("../handlers/auth");
const express = require("express");
const router = express.Router();

const { loginRules } = require("../validators/users");
const validate = require("../validators/validate");

router.post("/login", loginRules(), validate, auth.login);

module.exports = router;
