import express, { Request, Response, Router } from "express";
import passport from "passport";

const router: Router = express.Router();

router.get("/", passport.authenticate("session"), async (req: Request, res: Response) => {
    res.send("asdf");
});

module.exports = router;