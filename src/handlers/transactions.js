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
    const { amount, type_id: typeId, to, notes } = req.body;

    switch (typeId) {
      case 3:
        const topUp = await transaction.createTopUp(userId, amount);
        console.log(topUp);
        if (!topUp) {
          return sendResponse(res, false, 500, "Internal Server Error");
        }
        if (topUp.affectedRows > 0) {
          return sendResponse(res, true, 200, "Top Up Success");
        }
        return sendResponse(res, false, 400, "Top Up Failed");
      default:
        return sendResponse(res, true, 200, "Default Transaction");
    }
  } catch (error) {
    console.warn(error);
    return sendError(res, 500, error);
  }
};
