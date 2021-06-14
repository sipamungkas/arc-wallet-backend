const {
  sendError,
  sendResponseWithPagination,
  sendResponse,
} = require("../helpers/response");
const transaction = require("../models/transaction");

exports.getNotifications = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { page, limit } = req.query;
    const { baseUrl, path } = req;
    const pageNumber = Number(page) || 1;
    const limitPerPage = Number(limit) || 3;
    const offset = (pageNumber - 1) * limitPerPage;

    const notifications = await transaction.getAllNotifications(
      userId,
      limitPerPage,
      offset
    );

    const totalPage = Math.ceil(notifications.total / limitPerPage);
    const info = {
      total: notifications.total,
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
      "List of Notifications",
      notifications.data,
      info
    );
  } catch (error) {
    console.log(error);
    sendError(res, 500, error);
  }
};
