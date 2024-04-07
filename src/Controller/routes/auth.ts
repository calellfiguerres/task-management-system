import express, { Router, Request, Response } from "express";

import { User } from "../../Models/User";

const router: Router = express.Router();

router.route("/register")
    .get((req: Request, res: Response) => {
        res.render("auth/register");
    })
    .post(async (req: Request, res: Response) => {
        const u: User = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone
        });
        if (req.body.password === req.body.repassword) {
            u.setPassword(req.body.password);
        } else {
            res.send("Passwords must match!");
            return;
        }

        res.render("auth/register");
    });

module.exports = router;