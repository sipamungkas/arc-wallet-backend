require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const http = require("http");
const { socketConnection, sendNotification } = require("./src/services/socket");

const Router = require("./src/routers/index");
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.raw());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/v1", Router);

const port = process.env.PORT;
const server = http.createServer(app);
const socketOptions = {
  cors: {
    origin: "http://localhost:3000",
  },
};
socketConnection(server, socketOptions);

server.listen(port, () => console.log(`Listening on port ${port}`));
