const {
  sendError,
  sendResponseWithPagination,
  sendResponse,
} = require("../helpers/response");
const transaction = require("../models/transaction");

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
    const { amount, type_id: typeId, receiver, notes } = req.body;

    switch (typeId) {
      case 1:
        const isUserExists = await transaction.checkUserId(receiver);
        if (!isUserExists || isUserExists.length < 1)
          return sendResponse(res, false, 404, "Invalid User");

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
          return sendResponse(res, true, 200, "Transfer Success");
        }
        return sendResponse(res, false, 400, "Transfer Success Failed");
      case 2:
        const topUp = await transaction.createTopUp(userId, amount);

        if (!topUp) {
          return sendResponse(res, false, 500, "Internal Server Error");
        }
        if (topUp.affectedRows > 0) {
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
    const { search, page, limit } = req.query;
    const { baseUrl, path } = req;
    const pageNumber = Number(page) || 1;
    const limitPerPage = Number(limit) || 3;
    const offset = (pageNumber - 1) * limitPerPage;

    const transactions = await transaction.getAllTransaction(
      userId,

      limitPerPage,
      offset
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