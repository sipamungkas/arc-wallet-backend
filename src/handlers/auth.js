const jwt = require("jsonwebtoken");
const auth = require("../models/auth");
const bcrypt = require("bcrypt");
const { sendError, sendResponse } = require("../helpers/response");
const { formatUserAuthentication } = require("../helpers/users");

exports.login = async (req, res) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const saltRounds = Number(process.env.SALT_ROUNDS);

    const { email, password } = req.body;

    const user = await auth.login(email, password);
    if (!user) {
      return sendResponse(res, false, 401, "Invalid Credentials");
    }

    const loggedIn = await bcrypt.compare(password, user.password);
    if (!loggedIn) {
      return sendResponse(res, false, 401, "Invalid Credentials");
    }

    console.log(user);
    const data = {
      user_id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.roleId,
    };
    const token = jwt.sign(data, jwtSecret, {
      expiresIn: process.env.TOKEN_DURATION,
      issuer: process.env.TOKEN_ISSUER,
    });
    return sendResponse(
      res,
      true,
      200,
      "Login success",
      formatUserAuthentication(user, token)
    );
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error);
  }
};
