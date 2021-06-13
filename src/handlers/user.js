const userModel = require("../models/user");
const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcrypt");
const saltRounds = Number(process.env.SALT_ROUNDS);
// const crypto = require("crypto");

const { sendError, sendResponse } = require("../helpers/response");

exports.getUser = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const user = await userModel.getUser(userId);
    if (!user) {
      return sendResponse(res, false, 401, "Invalid Credentials");
    }
    return sendResponse(res, true, 200, "get user success", {
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      avatar: user.avatar,
      balance: user.balance,
      phone_number: user.phone_number,
    });
  } catch (error) {
    console.log(error);
    return sendError(res, 500, error);
  }
};

exports.getPhoneNumber = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const contactsRes = await userModel.getPhoneNumber(userId);
    return sendResponse(
      res,
      true,
      200,
      "get phone numbers success",
      contactsRes
    );
  } catch (error) {
    console.log(error);
    return sendError(res, 500, error);
  }
};

exports.addPhoneNumber = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { phone_number: phoneNumber } = req.body;
    const isPhoneNumberExists = await userModel.phoneNumberExists(
      userId,
      phoneNumber
    );
    if (!isPhoneNumberExists) {
      return sendResponse(res, false, 404, "User not found");
    }

    if (isPhoneNumberExists.length > 0) {
      return sendResponse(res, false, 200, "Phone number has already taken");
    }
    let isNumber = true;
    if (!isPhoneNumberExists) {
      isNumber = false;
    }

    const isUpdated = await userModel.addPhoneNumber(
      userId,
      phoneNumber,
      isNumber
    );
    console.log(isUpdated);
    if (isUpdated) return sendResponse(res, true, 200, "profile update");
    return sendResponse(res, false, 200, "Failed to update profile");
  } catch (error) {
    console.log(error);
    return sendError(res, 500, error);
  }
};

exports.deletePhoneNumber = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { idContact } = req.params;
    const user = await userModel.getUser(userId);
    if (!user) {
      return sendResponse(res, false, 404, "User not found");
    }
    const isUpdated = await userModel.deletePhoneNumber(idContact);
    if (isUpdated) return sendResponse(res, true, 200, "phone number deleted");
    return sendResponse(res, false, 200, "Failed to update profile");
  } catch (error) {
    console.log(error);
    return sendError(res, 500, error);
  }
};

exports.updatePhoneNumber = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { phone_number: phoneNumber } = req.body;
    const { idContact } = req.params;
    const user = await userModel.getUser(userId);
    if (!user) {
      return sendResponse(res, false, 404, "User not found");
    }
    const isUpdated = await userModel.updatePhoneNumber(
      userId,
      idContact,
      phoneNumber
    );
    if (isUpdated) return sendResponse(res, true, 200, "Phone number updated");
    return sendResponse(res, false, 200, "Failed to update profile");
  } catch (error) {
    console.log(error);
    return sendError(res, 500, error);
  }
};
exports.updateUser = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const {
      old_password: oldPassword,
      new_password: newPassword,
      old_pin: oldPin,
      new_pin: newPin,
      first_name: firstName,
      last_name: lastName,
    } = req.body;
    const user = await userModel.getUser(userId);
    if (!user) return sendResponse(res, false, 404, "User not found");
    let data = {};
    if (req.file) {
      const pathFile = path.join(
        __dirname,
        `../../public/images/${user.avatar}`
      );
      const exists = await fs.pathExists(pathFile);
      if (exists) {
        fs.unlink(pathFile);
      }
      const newPathFile = `avatars/${req.file.filename}`;
      data.avatar = newPathFile;
    }

    if (firstName) {
      if (firstName.length < 3) {
        return sendResponse(res, false, 422, "Minimum first name length is 3");
      }
      data.first_name = firstName;
    }
    if (lastName) {
      if (lastName.length < 3) {
        return sendResponse(res, false, 422, "Minimum last name length is 3");
      }
      data.last_name = lastName;
    }
    if (newPassword) {
      if (newPassword.length < 8) {
        return sendResponse(
          res,
          false,
          422,
          "Minimum new password length is 8"
        );
      }
      data.password = await bcrypt.hash(newPassword, saltRounds);
    }
    if (newPin) {
      if (newPin.length < 3) {
        return sendResponse(res, false, 422, "invalid pin");
      }
      data.pin = await bcrypt.hash(newPin, saltRounds);
    }
    if (Object.entries(data).length === 0) {
      return sendResponse(res, false, 422, "Edited Data can not be empty!");
    }

    if (data.password) {
      const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordMatch) {
        if (data.avatar) {
          const pathFile = path.join(
            __dirname,
            `../../public/images/${data.avatar}`
          );
          const exists = await fs.pathExists(pathFile);
          if (exists) {
            fs.unlink(pathFile);
          }
        }

        return sendResponse(res, false, 422, "Password doesn't match");
      }
    }
    if (data.pin) {
      const isPinMatch = await bcrypt.compare(oldPin, user.pin);
      if (!isPinMatch) {
        if (data.avatar) {
          const pathFile = path.join(
            __dirname,
            `../../public/images/${data.avatar}`
          );
          const exists = await fs.pathExists(pathFile);
          if (exists) {
            fs.unlink(pathFile);
          }
        }

        return sendResponse(res, false, 422, "Pin doesn't match");
      }
    }

    const isUpdated = await userModel.updateProfile(userId, data);
    if (isUpdated) return sendResponse(res, true, 200, "profile update");
    return sendResponse(res, false, 200, "Failed to update profile");
  } catch (error) {
    console.log(error);
    return sendError(res, 500, error);
  }
};
