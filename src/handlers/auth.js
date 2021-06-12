const jwt = require("jsonwebtoken");
const auth = require("../models/auth");
const bcrypt = require("bcrypt");
const client = require("../database/dbRedis");
// const crypto = require("crypto");

const {
  sendError,
  sendResponse,
  sendValidationError,
} = require("../helpers/response");
const { formatUserAuthentication } = require("../helpers/users");
const { validationFormatter } = require("../helpers/errors");
const emailService = require("../services/email");
const { generateOTP } = require("../helpers/otps");

const jwtSecret = process.env.JWT_SECRET;
const saltRounds = Number(process.env.SALT_ROUNDS);

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await auth.login(email, password);
    console.log(user);
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
    console.log(error);
    return sendError(res, 500, error);
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, pin } = req.body;

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

    const isOTPVerified = await auth.isOtpVerified(email);
    if (!isOTPVerified) {
      return sendResponse(res, false, 400, "Bad request");
    }

    if (isOTPVerified.length === 0) {
      return sendResponse(res, false, 401, "Please verifiy your otp first!");
    }

    if (isOTPVerified[0].verified != true) {
      return sendResponse(res, false, 401, "Please verifiy your otp again!");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedPin = await bcrypt.hash(pin, saltRounds);

    const newUser = {
      username,
      first_name: username,
      last_name: username,
      email,
      pin: hashedPin,
      password: hashedPassword,
    };

    await auth.createUser(newUser);
    return sendResponse(res, true, 201, "Account created!");
  } catch (error) {
    console.warn(error);
    return sendError(res, 500, error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const isEmailExists = await auth.isEmailExists(email);
    if (!isEmailExists)
      return sendResponse(res, false, 404, "E-mail not found");

    // const buffer = await crypto.randomBytes(20);
    // const token = buffer.toString("hex");
    // const expiredAt = new Date().getTime() + 3 * 60 * 60 * 1000;

    // await auth.setResetToken(email, expiredAt, token);
    // const link = `https://arc-wallet.sipamungkas.com?token=${token}`;
    // console.log(link);
    // emailService.sendResetLink(email, link);

    const otp = generateOTP(6);
    console.log(otp);
    const expiredAt = new Date().getTime() + 3 * 60 * 60 * 1000;
    const data = await auth.createOtp(email, otp, expiredAt);
    if (!data) return sendResponse(res, false, 500, "Internal Server Error");
    console.log(otp);
    emailService.sendOTP(email, otp);
    return sendResponse(
      res,
      true,
      200,
      "Reset Link has been sent to your email"
    );
  } catch (error) {
    return sendError(res, 500, error);
  }
};

exports.changePassword = async (req, res) => {
  try {
    // const { token } = req.query;
    const { email, password, otp } = req.body;

    // const resetInformation = await auth.getResetInformation(token);
    // if (!resetInformation.length === 0)
    //   return sendResponse(res, false, 401, "Invalid Token");

    // if (new Date(resetInformation[0].reset_expired) < new Date()) {
    //   return sendResponse(res, false, 401, "Verification Code Expired!");
    // }

    const user = await auth.userOldPassword(email);
    const data = await auth.checkOtp(email, otp);
    if (!data) return sendResponse(res, false, 500, "Internal Server Error");
    if (data.length === 0) return sendResponse(res, false, 400, "Invalid OTP");

    if (new Date(data[0].expire_at) < new Date()) {
      return sendResponse(res, false, 401, "OTP Expired");
    }

    const isPasswordMatch = await bcrypt.compare(password, user[0].password);

    if (isPasswordMatch)
      return sendResponse(
        res,
        false,
        200,
        "Please use a different password from the old one"
      );

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const isUpdated = await auth.setNewPassword(email, hashedPassword);

    if (isUpdated?.affectedRows > 0) {
      return sendResponse(res, true, 200, "Password updated");
    }

    return sendResponse(res, false, 200, "Failed to update the password");
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error);
  }
};

exports.createOTP = async (req, res) => {
  try {
    const { email, username } = req.body;

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

    const otp = generateOTP(6);
    console.log(otp);
    const expiredAt = new Date().getTime() + 3 * 60 * 60 * 1000;
    const data = await auth.createOtp(email, otp, expiredAt);
    if (!data) return sendResponse(res, false, 500, "Internal Server Error");
    console.log(otp);
    emailService.sendOTP(email, otp);
    return sendResponse(res, true, 200, "Please check your email for OTP");
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error);
  }
};

exports.otpVerification = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const data = await auth.checkOtp(email, otp);
    if (!data) return sendResponse(res, false, 500, "Internal Server Error");
    if (data.length === 0) return sendResponse(res, false, 400, "Bad request");

    if (new Date(data[0].expire_at) < new Date()) {
      return sendResponse(res, false, 401, "OTP Expired");
    }

    await auth.setOtpStatus(email, otp, true);

    return sendResponse(res, true, 200, "OTP Verification success");
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error);
  }
};
exports.logout = async (req, res) => {
  try {
    const { user, token } = req;
    const duration = Math.ceil(
      (new Date(user.exp * 1000) - new Date(Date.now())) / 1000
    );
    client.setex(`blacklist:${token}`, duration, true, (err) => {
      if (err) {
        return sendError(res, 500, err);
      }
      return sendResponse(res, true, 200, "Logout succes");
    });
  } catch (error) {
    return sendError(res, 500, error);
  }
};
