const socketIO = require("socket.io");
const { authenticateSocketToken } = require("../middlewares/authentication");

let io;
exports.socketConnection = (server, options) => {
  io = socketIO(server, options);

  io.use(authenticateSocketToken);

  io.on("connection", (socket) => {
    socket.onAny((events, ...args) => {
      console.log(events, args);
    });
    console.info(`Client connected [id=${socket.id}]`);
    socket.on("join", (...room) => {
      socket.join(room);
      // io.to(room).emit("notification", {
      //   title: "Succes Join Room",
      //   content: `Welcome to ${room}`,
      // });
      socket.on("disconnect", () => {
        socket.leave(room);
        console.info(`Client disconnected [id=${socket.id}]`);
      });
    });
  });
};

exports.sendMessage = (roomId, key, message) =>
  io.to(roomId).emit(key, message);

exports.sendNotification = (roomId, type, content) => {
  io.to(roomId).emit(type, content);
};

exports.sendMsgNotification = (roomId, content) => {
  io.to(roomId).emit("message-notification", content);
};

exports.getRooms = () => io.sockets.adapter.rooms;
