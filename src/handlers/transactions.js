const {
  sendError,
  sendResponseWithPagination,
  sendResponse,
} = require("../helpers/response");
const transaction = require("../models/transaction");
const user = require("../models/user");
const bcrypt = require("bcrypt");
const { isDate, format, sub } = require("date-fns");
const { sendNotification } = require("../services/socket");

exports.getReceiver = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { search, page, limit } = req.query;
    const { baseUrl, path } = req;
    const searchValue = `%${search || ""}%`;
    const pageNumber = Number(page) || 1;
    const limitPerPage = Number(limit) || 3;
    const offset = (pageNumber - 1) * limitPerPage;

    const receiver = await transaction.receiverList(
      userId,
      searchValue,
      limitPerPage,
      offset
    );
    console.log(receiver, [
      req.user,
      userId,
      searchValue,
      limitPerPage,
      offset,
    ]);
    const totalPage = Math.ceil(receiver.total / limitPerPage);
    const info = {
      total: receiver.total,
      current_page: pageNumber,
      total_page: totalPage,
      next:
        pageNumber >= totalPage
          ? null
          : `${baseUrl}${path}?page=${
              pageNumber + 1
            }&limit=${limitPerPage}&search=${search}`,
      prev:
        pageNumber === 1
          ? null
          : `${baseUrl}${path}?page=${
              pageNumber - 1
            }&limit=${limitPerPage}&search=${search}`,
    };

    return sendResponseWithPagination(
      res,
      true,
      200,
      "List of Receiver",
      receiver.data,
      info
    );
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error);
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const { amount, type_id: typeId, receiver, notes, pin } = req.body;

    switch (typeId) {
      case 1:
        const isUserExists = await transaction.checkUserId(receiver);
        if (!isUserExists || isUserExists.length < 1)
          return sendResponse(res, false, 404, "Invalid User");

        const sender = await user.getUser(userId);

        const data = await transaction.checkPin(userId);

        const isPinMatch = await bcrypt.compare(pin, data[0].pin);

        if (!isPinMatch)
          return sendResponse(res, false, 401, "Invalid Pin Code");

        const transfer = await transaction.createTransfer(
          userId,
          amount,
          receiver,
          notes
        );

        if (!transfer) {
          return sendResponse(res, false, 500, "Internal Server Error");
        }
        if (transfer.affectedRows > 0) {
          const content = {
            title: "New Transfer!",
            content: `${sender.first_name} has transferred money to you`,
          };

          sendNotification(`notification:${receiver}`, content);
          return sendResponse(res, true, 200, "Transfer Success");
        }
        return sendResponse(res, false, 400, "Transfer Success Failed");
      case 2:
        const topUp = await transaction.createTopUp(userId, amount);

        if (!topUp) {
          return sendResponse(res, false, 500, "Internal Server Error");
        }
        if (topUp.affectedRows > 0) {
          const content = {
            title: "Top Up Success!",
            content: `Top Up ${amount} success`,
          };

          sendNotification(`notification:${receiver}`, content);
          return sendResponse(res, true, 200, "Top Up Success");
        }
        return sendResponse(res, false, 400, "Top Up Failed");

      default:
        return sendResponse(res, false, 400, "Bad request");
    }
  } catch (error) {
    console.warn(error);
    return sendError(res, 500, error);
  }
};

exports.subcription = async (req, res) => {
  try {
    const { amount, user_id: userId, notes } = req.body;
    const isUserExists = await transaction.checkUserId(userId);
    if (!isUserExists || isUserExists.length < 1)
      return sendResponse(res, false, 404, "Invalid User");

    const subcription = await transaction.createSubcription(
      userId,
      amount,
      notes
    );

    if (!subcription) {
      return sendResponse(res, false, 500, "Internal Server Error");
    }
    if (subcription.affectedRows > 0) {
      const content = {
        title: "Subcription",
        content: `Ypur ${notes}(${amount}) subcription has been paid`,
      };

      sendNotification(`notification:${userId}`, content);
      return sendResponse(res, true, 200, "Subcription Success");
    }
    return sendResponse(res, false, 400, "Subcription Success Failed");
  } catch (error) {
    console.warn(error);
    return sendError(res, 500, error);
  }
};

exports.transactionDetail = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { transactionId } = req.params;

    const data = await transaction.getTransactionById(userId, transactionId);
    if (data.length < 1)
      return sendResponse(res, false, 404, "Transaction not found");
    return sendResponse(res, true, 200, "Transaction Detail", data);
  } catch (error) {
    console.log(error);
    return sendError(res, 500, error);
  }
};

exports.allTransaction = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { page, limit, filter, start, end } = req.query;
    const { baseUrl, path } = req;
    const pageNumber = Number(page) || 1;
    const limitPerPage = Number(limit) || 3;
    const offset = (pageNumber - 1) * limitPerPage;
    let formattedFilter = filter ? filter : "all";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const formattedStartDate = isDate(startDate)
      ? format(startDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");
    const formattedEndDate = isDate(endDate)
      ? format(endDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");

    const transactions = await transaction.getAllTransaction(
      userId,
      limitPerPage,
      offset,
      formattedFilter,
      `${formattedStartDate} 00:00:01`,
      `${formattedEndDate} 23:59:59`
    );

    const totalPage = Math.ceil(transactions.total / limitPerPage);
    const info = {
      total: transactions.total,
      current_page: pageNumber,
      total_page: totalPage,
      next:
        pageNumber >= totalPage
          ? null
          : `${baseUrl}${path}?page=${pageNumber + 1}&limit=${limitPerPage}`,
      prev:
        pageNumber === 1
          ? null
          : `${baseUrl}${path}?page=${pageNumber - 1}&limit=${limitPerPage}`,
    };

    return sendResponseWithPagination(
      res,
      true,
      200,
      "List of Transaction",
      transactions.data,
      info
    );
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error);
  }
};

exports.charts = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const end = new Date();
    const start = sub(end, { days: 7 });
    const formattedStart = `${format(start, "yyyy-MM-dd")} 00:00:01`;
    const formattedEnd = `${format(end, "yyyy-MM-dd")} 23:59:59`;

    const data = await transaction.getCharts(
      userId,
      formattedStart,
      formattedEnd
    );

    const incomeData = data.filter(
      (t) => (t.type_id === 1 && t.receiver == userId) || t.type_id === 2
    );
    const expenseData = data.filter(
      (t) => (t.type_id === 1 && t.receiver != userId) || t.type_id === 3
    );

    const income = incomeData.map((data) => {
      return { amount: data.amount, day: data.created_at };
      // return { amount: data.amount, day: format(data.created_at, "E") };
    });
    const expense = expenseData.map((data) => {
      // return { amount: data.amount, day: format(data.created_at, "E") };
      return { amount: data.amount, day: data.created_at };
    });

    return sendResponse(res, true, 200, "Charts in a week", {
      expense,
      income,
    });
  } catch (error) {
    console.log(error);
    sendError(res, 500, error);
  }
};
