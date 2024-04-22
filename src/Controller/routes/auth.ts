import express, { Router, Request, Response, query } from "express";

import { User } from "../../Models/User";
import { PassportStatic } from "passport";
import { FlashMessageType } from "../FlashMessageType";
import { sendPasswordResetEmail } from "../emailController";
import { PasswordResetToken } from "../../Models/PasswordResetToken";
const passport: PassportStatic = require("./../authController");

const router: Router = express.Router();

router.route("/register")
    .all(passport.authenticate("session"))
    .get((req: Request, res: Response) => {
        res.render("auth/register", {
            messages: req.flash(),
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    })
    .post(async (req: Request, res: Response) => {
        if (req.body.password !== req.body.passwordCheck) {
            req.flash(FlashMessageType.DANGER, "Passwords must match!");
            res.redirect("/auth/register");
            return;
        }

        const userCount: number = await User.count();

        const u: User = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            administrator: userCount == 0 ? true : false,
            active: true
        });
        u.setPassword(req.body.password);
        u.save();
        req.flash(FlashMessageType.INFO, "Registration Successful!");
        res.redirect("/auth/login");
    });

router.route("/login")
    .all(passport.authenticate("session"))
    .get((req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            res.redirect("/tasks");
            return;
        }
        res.render("auth/login", {
            messages: req.flash(),
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    })
    .post(passport.authenticate("local", { successRedirect: "/tasks/", failureRedirect: "/auth/login" }));

router.get("/logout", passport.authenticate("session"), (req: Request, res: Response) => {
    req.logout((err: any) => {
        if (err) {

        }
        req.flash(FlashMessageType.SUCCESS, "Logout successful!")
        res.redirect("/auth/login");
    });
});


router.get("/resetpassword", (req: Request, res: Response) => {
    if (req.query.token) {
        res.redirect(`/auth/resetpassword/confirm?token=${req.query.token}`);
    } else {
        res.redirect(`/auth/resetpassword/request`);
    }
});

router.route("/resetpassword/confirm")
    .all(passport.authenticate("session"))
    .get(async (req: Request, res: Response) => {
        res.render("auth/resetPassword", {
            messages: req.flash(),
            isAuthenticated: req.isAuthenticated(),
            user: req.user,
            token: req.query.token
        })
    })
    .post(async (req: Request, res: Response) => {
        if (req.body.password != req.body.passwordCheck) {
            req.flash(FlashMessageType.DANGER, "Passwords must match!");
            res.redirect(`/auth/resetpassword/confirm?token=${req.body.prtToken}`);
            return;
        }

        console.log(req.body.prtToken);
        console.log(req.body.password);
        console.log(req.body.passwordCheck);

        const prt: PasswordResetToken = (await PasswordResetToken.findAll({
            where: {
                token: req.body.prtToken
            }
        }))[0];

        if (prt == null || (prt.expireDate != null && new Date() > prt.expireDate)) {
            if (prt != null) {
                // await prt.destroy();
            }
            req.flash(FlashMessageType.DANGER, "Invalid Password Reset Token! You may need to request a new one.");
            res.redirect(`/auth/resetpassword/request`);
            return;
        }
        
        const user: User = (await User.findAll({
            where: {
                id: prt.userId
            }
        }))[0];

        if (user == null) {            
            req.flash(FlashMessageType.DANGER, "The user associated with this Password Reset Token could not be found!");
            res.redirect(`/auth/resetpassword/request`);
            return;
        }
        
        user.setPassword(req.body.password);
        await user.save();

        req.flash(FlashMessageType.SUCCESS, "Password reset successful!");
        res.redirect("/auth/login");
    });

router.route("/resetpassword/request")
    .all(passport.authenticate("session"))
    .get((req: Request, res: Response) => {
        if (req.query.token) {
            res.redirect(`/auth/resetpassword/confirm?token=${req.query.token}`);
            return;
        }
        // No token provided; needs to request one
        res.render("auth/requestPasswordReset", {
            messages: req.flash(),
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    })
    .post(async (req: Request, res: Response) => {
        if (req.query.token) {
            res.redirect(`/auth/resetpassword/confirm?token=${req.query.token}`);
            return;
        }
        // No token provided; needs to request one
        
        const email: string | null = req.body.email;
        const userToReset: User = (await User.findAll({ where: { email: email }}))[0];
        
        if (userToReset != null) {
            await sendPasswordResetEmail(userToReset);
        }

        req.flash(FlashMessageType.SUCCESS, "If this user exists, they will be sent a password reset link.");
        res.redirect("/auth/login");
    });

module.exports = router;