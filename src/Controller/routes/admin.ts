import express, { Router, Request, Response } from "express";
import passport from "passport";

const router: Router = express.Router();

router.get("/", passport.authenticate("session"), (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
        res.status(403).send("unauthorized");
        return;
    }
    res.send("asdf");
});

module.exports = router;