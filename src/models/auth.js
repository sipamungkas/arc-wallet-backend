const db = require("../database/dbMySql");

exports.login = (username) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = [
      "SELECT u.id, u.avatar, u.first_name, u.last_name, u.username, u.password, u.balance,",
      "(SELECT phone_number FROM contacts c where c.`primary` is TRUE and c.user_id = u.id) as phone_number",
      "FROM users u LEFT JOIN contacts c on c.user_id = u.id where u.email = ?",
    ];
    // const columns = ["u.id", "u.username", "u.password", "u.name", "r.name"];
    db.query(sqlQuery.join(" "), username, function (error, results) {
      if (error) return reject(error);
      return resolve(results[0]);
    });
  });
};

exports.isUsernameExists = (username) => {
  return new Promise((resolve, reject) => {
    const isUsernameExistsQuery =
      "Select username FROM users where username = ?";
    db.query(isUsernameExistsQuery, [username], function (error, results) {
      if (error) return reject(error);

      if (results.length > 0) {
        return resolve(true);
      }

      return resolve(false);
    });
  });
};

exports.isEmailExists = (email) => {
  return new Promise((resolve, reject) => {
    const isEmailExistsQuery = "Select email FROM users where email = ?";
    db.query(isEmailExistsQuery, [email], function (error, results) {
      if (error) return reject(error);

      if (results.length > 0) {
        return resolve(true);
      }

      return resolve(false);
    });
  });
};

exports.createUser = (user) => {
  return new Promise((resolve, reject) => {
    const insertQuery = "INSERT INTO users SET ?";
    db.query(insertQuery, user, (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};

exports.setResetToken = (email, expiredAt, token) => {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "UPDATE users set reset_token = ?, reset_expired = ? where email = ? ";
    db.query(sqlQuery, [token, expiredAt, email], (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};

exports.setNewPassword = (email, password) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = "UPDATE users SET password = ? where email = ?";
    db.query(sqlQuery, [password, email], (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};

exports.getResetInformation = (token) => {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "SELECT reset_expired,password from users where reset_token = ?";
    db.query(sqlQuery, token, (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};

exports.createOtp = (email, otp, expiredAt) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((transactionErr) => {
      if (transactionErr) {
        db.rollback(() => {
          return reject(transactionErr);
        });
      }

      let createOTP = "INSERT into otps(otp,email,expire_at) values(?,?,?)";
      let values = [otp, email, expiredAt];
      const checkQuery = "SELECT expire_at,verified FROM otps where email = ?";
      db.query(checkQuery, email, (checkErr, checkResults) => {
        if (checkErr) {
          return db.rollback(() => {
            reject(checkErr);
          });
        }
        if (checkResults.length > 0) {
          createOTP =
            "UPDATE otps SET otp = ?, verified = FALSE,expire_at = ? where email = ?";
          values = [otp, expiredAt, email];
        }

        db.query(createOTP, values, (otpError, otpResults) => {
          if (otpError) {
            return db.rollback(() => {
              reject(otpError);
            });
          }

          db.commit(() => {
            return resolve(otpResults);
          });
        });
      });
    });
  });
};

exports.checkOtp = (email, otp) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = "SELECT expire_at from otps where email = ? and otp = ? ";
    db.query(sqlQuery, [email, otp], (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};

exports.setOtpStatus = (email, otp, status) => {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "UPDATE otps SET verified = ? where email = ? and otp = ? ";
    db.query(sqlQuery, [status, email, otp], (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};

exports.isOtpVerified = (email) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = "SELECT verified FROM otps where email = ?";
    db.query(sqlQuery, [email], (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};

exports.userOldPassword = (email) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = "SELECT password FROM users where email = ?";
    db.query(sqlQuery, email, (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};
