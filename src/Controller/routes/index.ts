import express, { Router, Request, Response } from "express";

const router: Router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.render("index", { test: "hello world!" })
});

router.get("/login", (req: Request, res: Response) => {
    res.redirect("/auth/login");
});

router.get("/register", (req: Request, res: Response) => {
    res.redirect("/auth/register");
});

module.exports = router;