import express, { Express } from "express";
const bodyParser = require("body-parser");
const session = require("express-session");

// Create the Express app
const app: Express = express();

// Set the view engine to EJS and which directory it search for templates
app.set("view engine", "ejs");
app.set("views", "./src/Views")

// Session handling
app.use(session({
    secret: "this is a very secret thing",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Body parser for forms
app.use(bodyParser.urlencoded({ extended: true }));

// Set the static directory to use
app.use("/static", express.static("./src/Views/static"))

// Load the `index` routes
const indexRouter = require("./Controller/routes/index");
app.use("/", indexRouter);

// Load the `auth` routes
const authRouter = require("./Controller/routes/auth");
app.use("/auth", authRouter)

// Export Express app
module.exports = app;