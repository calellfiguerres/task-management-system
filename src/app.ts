import express, { Express } from "express";

const app: Express = express();

const indexRouter = require("./Controller/routes/index");

app.use("/static", express.static("./src/Views/static"))
app.use("/", indexRouter);

module.exports = app;