const db = require("../database/dbMySql");

exports.receiverList = (userId, search, limit, offset) => {
  return new Promise((resolve, reject) => {
    let total = 0;
    const sqlQuery = [
      "SELECT u.first_name,u.last_name,c.phone_number FROM users u",
      "LEFT JOIN contacts c on c.user_id = u.id",
      "WHERE u.id != ? and (u.first_name like ? or u.last_name like ?)",
      "ORDER BY u.first_name ASC",
      "LIMIT ? OFFSET ?",
    ];

    db.query(
      sqlQuery.join(" "),
      [userId, search, search, limit, offset],
      (error, results) => {
        if (error) return reject(error);

        const countSql =
          "SELECT count(u.id) AS total FROM users u where u.id != ?";
        db.query(countSql, [userId], (countErr, countResults) => {
          if (countErr) return reject(countErr);
          total = countResults[0].total;
          return resolve({ data: results, total });
        });
      }
    );
  });
};
