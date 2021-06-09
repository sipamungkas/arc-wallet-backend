const express = require("express");
const Router = express.Router();

Router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET,PATCH,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Authorization,Content-type");
    return res.sendStatus(200);
  }
  next();
});

Router.get("/", (req, res) => {
  return res.status(200).send("pong");
});

module.exports = Router;
