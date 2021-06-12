const db = require("../database/dbMySql");
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
exports.changePrimaryPhoneNumber = (userId, params) => {
  return new Promise((resolve, reject) => {
    if (params.phone_number) {
      const sqlQuery =
        "UPDATE contacts SET primary = 1 WHERE user_id = ? and phone_number = ?";
      db.query(sqlQuery, [userId, params.phone_number], (error, results) => {
        if (error) return reject(error);
        if (results.affectedRows > 0) return resolve(true);
        return resolve(false);
      });
    } else {
      return resolve(false);
    }
  });
};
