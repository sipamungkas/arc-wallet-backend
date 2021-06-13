const db = require("../database/dbMySql");
const { v4: uuidV4 } = require("uuid");
const mysql = require("mysql");

exports.receiverList = (userId, search, limit, offset) => {
  return new Promise((resolve, reject) => {
    let total = 0;
    const sqlQuery = [
      "SELECT u.id as id_receiver,u.avatar,u.username,u.first_name,u.last_name,c.phone_number FROM users u",
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

        const countSql = [
          "SELECT count(u.id) AS total FROM users u",
          "WHERE u.id != ? and (u.first_name like ? or u.last_name like ?)",
        ];
        db.query(
          countSql.join(" "),
          [userId, search, search],
          (countErr, countResults) => {
            if (countErr) return reject(countErr);
            total = countResults[0].total;
            return resolve({ data: results, total });
          }
        );
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
        "INSERT INTO transactions(id,user_id,amount,type_id,notes) values (?,?,?,2,'Top Up')";

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

exports.createSubcription = (userId, amount, notes) => {
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
        "INSERT INTO transactions(id,user_id,amount,type_id,notes) values (?,?,?,3,?)";

      db.query(
        inserTransaction,
        [id, userId, amount, notes],
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

              if (currentBalance < amount) {
                db.rollback(() => {
                  return reject("Insufficent Balance");
                });
              }

              const newBalance = currentBalance - amount;

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

exports.checkUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = "SELECT id FROM users u where u.id = ?";
    db.query(sqlQuery, userId, (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};

exports.createTransfer = (userId, amount, receiver, notes) => {
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
        "INSERT INTO transactions(id,user_id,amount,receiver,notes,type_id) values (?,?,?,?,?,1)";

      db.query(
        inserTransaction,
        [id, userId, amount, receiver, notes],
        (insertTransactionError) => {
          if (insertTransactionError) {
            return db.rollback(() => {
              return reject(insertTransactionError);
            });
          }

          // get sender current balance
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

              // update sender balance
              const currentBalance = currentBalanceSuccess[0].balance;

              if (currentBalance < amount) {
                db.rollback(() => {
                  return reject("Insufficent Balance");
                });
              }

              const newBalance = currentBalance - amount;

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

                  // get receiver current balance

                  db.query(
                    currentBalanceSQL,
                    receiver,
                    (
                      receiverCurrentBalanceError,
                      receiverCurrentBalanceSuccess
                    ) => {
                      if (receiverCurrentBalanceError) {
                        return db.rollback(() => {
                          return reject(receiverCurrentBalanceError);
                        });
                      }

                      const receiverCurrentBalance =
                        receiverCurrentBalanceSuccess[0].balance;

                      const receiverNewBalance =
                        receiverCurrentBalance + amount;

                      db.query(
                        updateBalanceQuery,
                        [receiverNewBalance, receiver],
                        (
                          updateReceiverBalanceError,
                          updateReceiverBalanceSuccess
                        ) => {
                          if (updateReceiverBalanceError) {
                            return db.rollback(() => {
                              return reject(updateReceiverBalanceError);
                            });
                          }

                          db.commit((commitError) => {
                            if (commitError) {
                              return db.rollback(() => {
                                return reject(commitError);
                              });
                            }
                            return resolve(updateReceiverBalanceSuccess);
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};

exports.getTransactionById = (userId, transactionId) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = [
      "SELECT t.*, type.name as type, sender.username as sender,",
      "receiver_data .username as receiver_name, (SELECT c.phone_number FROM contacts c",
      "where c.user_id = t.receiver and c.`primary` is TRUE ) as phone_number ",
      "FROM transactions t LEFT JOIN types as type on type.id = t.type_id",
      "LEFT JOIN users as sender on sender.id = t.user_id",
      "LEFT join users as receiver_data on receiver_data.id = t.receiver",
      "WHERE t.user_id = ? and t.id = ? ",
    ];
    db.query(sqlQuery.join(" "), [userId, transactionId], (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};

exports.getAllTransaction = (
  userId,
  limit,
  offset,
  filter,
  startDate,
  endDate
) => {
  return new Promise((resolve, reject) => {
    let total = 0;
    const values = [userId, userId];
    const sqlQuery = [
      "SELECT t.*, type.name as type, sender.username as sender, receiver_data.avatar as receiver_avatar,",
      "receiver_data.username as receiver_name, (SELECT c.phone_number FROM contacts c",
      "where c.user_id = t.receiver and c.`primary` is TRUE ) as phone_number ",
      "FROM transactions t LEFT JOIN types as type on type.id = t.type_id",
      "LEFT JOIN users as sender on sender.id = t.user_id",
      "LEFT join users as receiver_data on receiver_data.id = t.receiver",
    ];

    switch (filter) {
      case "expense":
        sqlQuery.push(
          "WHERE (t.user_id = ? and t.type_id = 3) or (t.user_id = ? and t.type_id = 1)"
        );
        break;
      case "income":
        sqlQuery.push(
          "WHERE (t.receiver = ? and t.type_id = 1) or (t.user_id = ? and t.type_id = 2 )"
        );

        break;
      default:
        sqlQuery.push("WHERE t.user_id = ? or t.receiver = ? ");
        break;
    }

    sqlQuery.push("And t.created_at BETWEEN ? and ?");
    values.push(startDate, endDate);

    sqlQuery.push("ORDER BY t.created_at desc LIMIT ? OFFSET ?");
    values.push(limit, offset);

    db.query(sqlQuery.join(" "), values, (error, results) => {
      if (error) return reject(error);

      const countSql =
        "SELECT count(t.id) AS total FROM transactions t where t.user_id = ?";
      db.query(countSql, [userId], (countErr, countResults) => {
        if (countErr) return reject(countErr);
        total = countResults[0].total;
        return resolve({ data: results, total });
      });
    });
  });
};

exports.checkPin = (userId) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = "SELECT pin FROM users u WHERE u.id = ?";
    db.query(sqlQuery, userId, (error, results) => {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};
