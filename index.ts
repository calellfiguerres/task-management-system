import { Express } from "express";

// Get the Express app we create
const app: Express = require("./src/app");
const port = process.env.PORT || 3000;

// Run it on the specified port
app.listen(port, () => {
    console.log(`[Server]: Server is listening to http://${process.env.HOSTNAME}:${port}`);
});