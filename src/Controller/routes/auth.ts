import express, { Router, Request, Response } from "express";

import { User } from "../../Models/User";
const passport = require("../authController");

const router: Router = express.Router();

router.route("/register")
    .get((req: Request, res: Response) => {
        res.render("auth/register", { isAuthenticated: req.isAuthenticated(), user: req.user });
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
            phone: req.body.phone,
            administrator: false,
            active: true
        });
        u.setPassword(req.body.password);
        u.save();
        res.redirect("/auth/login");
    });

router.route("/login")
    .all(passport.authenticate("session"))
    .get((req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            res.redirect("/tasks");
            return;
        }
        res.render("auth/login", { isAuthenticated: req.isAuthenticated(), user: req.user });
    })
    .post(passport.authenticate("local", { successRedirect: "/tasks/", failureRedirect: "/auth/login" }));

router.get("/logout", passport.authenticate("session"), (req: Request, res: Response) => {
    req.logout((err: any) => {
        if (err) {

        }
        res.redirect("/auth/login");
    });
});

module.exports = router;