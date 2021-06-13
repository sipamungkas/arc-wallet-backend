const multer = require("multer");
const path = require("path");
const { sendError } = require("../helpers/response");
const fs = require("fs-extra");

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("./public/images/avatars")) {
      fs.mkdirSync("./public/images/avatars", { recursive: true });
    }
    cb(null, "./public/images/avatars");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `avatar-${req.user.user_id}-${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowedExt = /jpg|png|jpeg|svg|gif/i;
  const isAllowed = allowedExt.test(path.extname(file.originalname));
  console.log(path.extname(file.originalname));
  if (!isAllowed) return cb(new Error("Images only"));
  cb(null, true);
};

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 10 ** 6,
  },
  fileFilter: imageFileFilter,
});

const errorMulterHandler = (uploadFunction) => {
  return (req, res, next) => {
    uploadFunction(req, res, function (err) {
      if (err) return sendError(res, 500, err);
      next();
    });
  };
};

module.exports = { errorMulterHandler, uploadAvatar };
