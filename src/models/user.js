const db = require("../database/dbMySql");
const mysql = require("mysql");

exports.getUser = (userId) => {
  return new Promise((resolve, reject) => {
    const getUserQuery =
      "Select users.id,users.username,users.first_name,users.last_name,users.email,users.avatar,users.balance,users.password,users.pin, (SELECT phone_number FROM contacts c where c.`primary` is TRUE and c.user_id = users.id) as phone_number FROM users left join contacts on users.id = contacts.user_id where users.id = ?";
    db.query(getUserQuery, [userId], function (error, results) {
      if (error) return reject(error);
      return resolve(results[0]);
    });
  });
};
exports.updateProfile = (userId, params) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = "UPDATE users SET ? where id = ?";
    db.query(sqlQuery, [params, userId], (error, results) => {
      if (error) return reject(error);
      if (results.affectedRows > 0) return resolve(true);
      return resolve(false);
    });
  });
};

exports.getPhoneNumber = (userId) => {
  return new Promise((resolve, reject) => {
    const getUserQuery =
      "Select id,phone_number,`primary` from contacts where user_id = ?";
    db.query(getUserQuery, [userId], function (error, results) {
      if (error) return reject(error);
      return resolve(results[0]);
    });
  });
};

exports.addPhoneNumber = (userId, params, number) => {
  return new Promise((resolve, reject) => {
    if (params) {
      let sqlQuery =
        "INSERT INTO contacts (user_id,phone_number,`primary`) VALUES (?, ?, 0)";
      if (!number) {
        sqlQuery =
          "INSERT INTO contacts (user_id,phone_number,`primary`) VALUES (?, ?, 1)";
      }
      db.query(sqlQuery, [userId, params], (error, results) => {
        console.log(error, results);
        if (error) return reject(error);
        if (results.affectedRows > 0) return resolve(true);
        return resolve(false);
      });
    } else {
      return resolve(false);
    }
  });
};

exports.deletePhoneNumber = (params) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = "DELETE FROM contacts WHERE id = ?";
    db.query(sqlQuery, [params], (error, results) => {
      if (error) return reject(error);
      if (results.affectedRows > 0) return resolve(true);
      return resolve(false);
    });
  });
};

exports.updatePhoneNumber = (idUser, params, phoneNumber) => {
  return new Promise((resolve, reject) => {
    if (phoneNumber) {
      const sqlQuery = "UPDATE contacts SET phone_number = ? WHERE id = ?";
      db.query(sqlQuery, [phoneNumber, params], (error, results) => {
        console.log(phoneNumber, params);
        if (error) return reject(error);
        if (results.affectedRows > 0) return resolve(true);
        return resolve(false);
      });
    } else {
      const sqlQuery = "UPDATE contacts SET `primary` = 1 WHERE id = ?";
      db.query(
        "UPDATE contacts SET `primary` = 0 WHERE user_id = ? and `primary` is TRUE",
        idUser,
        (error) => {
          if (error) return reject(error);
        }
      );
      db.query(sqlQuery, [params], (error, results) => {
        if (error) return reject(error);
        if (results.affectedRows > 0) return resolve(true);
        return resolve(false);
      });
    }
  });
};

exports.phoneNumberExists = (userId, phoneNumber) => {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "SELECT id FROM contacts WHERE user_id = ? and phone_number = ?";
    db.query(sqlQuery, [userId, phoneNumber], (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};
