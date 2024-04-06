import { Express } from "express";

// const indexRouter = require()

const app: Express = require("./src/app");
const port = 3000;

app.listen(port, () => {
    console.log(`[Server]: Server is listening to http://localhost:${port}`);
});