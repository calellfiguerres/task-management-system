import express, { Router, Request, Response } from "express";
import passport from "passport";

const router: Router = express.Router();

router.get("/", passport.authenticate("session"), (req: any, res: Response) => {
    res.send("Hello from tasks!");
});