import express, { Router, Request, Response } from "express";

import { User } from "../../Models/User";
const passport = require("../authController");

const router: Router = express.Router();

router.route("/register")
    .get((req: Request, res: Response) => {
        res.render("auth/register");
    })
    .post(async (req: Request, res: Response) => {
        if (req.body.password !== req.body.passwordCheck) {
            res.send("Passwords must match!");
            return;
        }
        const u: User = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone
        });
        u.setPassword(req.body.password);
        u.save();

        console.log(u);

        // res.render("auth/register");
        res.redirect("/auth/login");
    });

router.route("/login")
    .get((req: Request, res: Response) => {
        res.render("auth/login");
    })
    .post(passport.authenticate("local", { successRedirect: "/tasks/", failureRedirect: "/auth/login" }));

router.route("/test")
    .all(passport.authenticate("session"))
    .get((req: Request, res: Response) => {
        console.log(typeof req);
        console.log(req.user);
        res.send(req.user);
    });


router.get("/aslkdj", passport.authenticate("session"), (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        // is authenticated
        req.user; // is a User object
        res.send("asdflkj");
    } else {
        req.user; // is undefined
        res.send("go away")
    }
});

router.get("/logout", passport.authenticate("session"), (req: Request, res: Response) => {
    console.log(req.isAuthenticated());
    // console.log(req);
    req.logout((err: any) => {
        if (err) {

        }
        res.send("logout");
    });
});

module.exports = router;