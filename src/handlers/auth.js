const jwt = require("jsonwebtoken");
const auth = require("../models/auth");
const bcrypt = require("bcrypt");

const {
  sendError,
  sendResponse,
  sendValidationError,
} = require("../helpers/response");
const { formatUserAuthentication } = require("../helpers/users");
const { validationFormatter } = require("../helpers/errors");

const jwtSecret = process.env.JWT_SECRET;
const saltRounds = Number(process.env.SALT_ROUNDS);

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await auth.login(email, password);
    if (!user) {
      return sendResponse(res, false, 401, "Invalid Credentials");
    }

    const loggedIn = await bcrypt.compare(password, user.password);
    if (!loggedIn) {
      return sendResponse(res, false, 401, "Invalid Credentials");
    }

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
    return sendError(res, 500, error);
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, pin } = req.body;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = {
      username,
      email,
      pin,
      password: hashedPassword,
    };
    const isEmailExists = await auth.isEmailExists(email);

    if (isEmailExists)
      return sendValidationError(res, [
        validationFormatter("email", "E-mail already in use"),
      ]);

    const isUsernameExists = await auth.isUsernameExists(username);

    if (isUsernameExists)
      return sendValidationError(res, [
        validationFormatter("username", "Username already in use"),
      ]);

    await auth.createUser(newUser);
    return sendResponse(res, true, 201, "Account created!");
  } catch (error) {
    return sendError(res, 500, error);
  }
};
