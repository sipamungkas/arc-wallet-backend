const db = require("../database/dbMySql");
const { v4: uuidV4 } = require("uuid");

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

exports.createTopUp = (userId, amount) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((transactionErr) => {
      if (transactionErr) {
        return db.rollback(() => {
          return reject(transactionErr);
        });
      }

      // create new transaction

      const id = uuidV4();
      const inserTransaction =
        "INSERT INTO transactions(id,user_id,amount,type_id,notes) values (?,?,?,3,'Top Up')";
      console.log([id, userId, amount], inserTransaction);
      db.query(
        inserTransaction,
        [id, userId, amount],
        (insertTransactionError) => {
          if (insertTransactionError) {
            return db.rollback(() => {
              return reject(insertTransactionError);
            });
          }

          // get current balance
          const currentBalanceSQL =
            "SELECT u.balance FROM users u where u.id = ?";
          db.query(
            currentBalanceSQL,
            userId,
            (currentBalanceError, currentBalanceSuccess) => {
              if (currentBalanceError) {
                return db.rollback(() => {
                  return reject(currentBalanceError);
                });
              }

              // update balance
              const currentBalance = currentBalanceSuccess[0].balance;
              const newBalance = currentBalance + amount;
              const updateBalanceQuery =
                "UPDATE users SET balance = ? where id = ?";
              db.query(
                updateBalanceQuery,
                [newBalance, userId],
                (updateBalanceError, updateBalanceSuccess) => {
                  if (updateBalanceError) {
                    return db.rollback(() => {
                      return reject(updateBalanceError);
                    });
                  }
                  db.commit((commitError) => {
                    if (commitError) {
                      return db.rollback(() => {
                        return reject(commitError);
                      });
                    }
                    return resolve(updateBalanceSuccess);
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};
