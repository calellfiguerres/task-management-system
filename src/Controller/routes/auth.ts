import express, { Router, Request, Response } from "express";

import { User } from "../../Models/User";
const passport = require("../authController");

const router: Router = express.Router();

router.route("/register")
    .get((req: Request, res: Response) => {
        res.render("auth/register");
    })
    .post(async (req: Request, res: Response) => {
        if (req.body.password !== req.body.repassword) {
            res.send("Passwords must match!");
            return;
        }
        const u: User = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone
        });
        u.setPassword(req.body.password);
        u.save();

        console.log(u);

        res.render("auth/register");
    });

router.route("/login")
    .get((req: Request, res: Response) => {
        res.render("auth/login");
    })
    .post(passport.authenticate("local", { successRedirect: "/", failureRedirect: "/login" }));

// router.get("/test", passport.authenticate("session"), (req: any, res: Response) => {
//     // console.log(req);
//     console.log(req.isAuthenticated());
//     if (req.isAuthenticated()) {
//         console.log("authed");
//         console.log(req.user);
//     }
//     res.send(req.isAuthenticated());
// });

router.route("/test")
    .all(passport.authenticate("session"))
    .get((req: Request, res: Response) => {
        console.log(req.user);
        res.send(req.user);
    });

router.get("/logout", passport.authenticate("session"), (req: any, res: Response) => {
    console.log(req.isAuthenticated());
    // console.log(req);
    req.logout((err: any) => {
        if (err) {

        }
        res.send("logout");
    });
});

module.exports = router;