import express, { Express } from "express";

const app: Express = express();

const indexRouter = require("./Controller/routes/index");

app.set("view engine", "ejs");
app.set("views", "./src/Views")

app.use("/static", express.static("./src/Views/static"))
app.use("/", indexRouter);

module.exports = app;