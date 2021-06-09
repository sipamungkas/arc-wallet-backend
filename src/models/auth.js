const db = require("../database/dbMySql");

exports.login = (username) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = [
      "SELECT u.id, u.avatar, u.first_name, u.last_name, u.username, u.password, u.balance",
      "FROM users u where u.email = ?",
    ];
    // const columns = ["u.id", "u.username", "u.password", "u.name", "r.name"];
    db.query(
      sqlQuery.join(" "),
      [username, username],
      function (error, results) {
        if (error) return reject(error);
        return resolve(results[0]);
      }
    );
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
