import express, { Router, Request, Response } from "express";
import passport, { use } from "passport";
import { User } from "../../Models/User";
import { FlashMessageType } from "../FlashMessageType";
import { sendPasswordResetEmail } from "../emailController";

const router: Router = express.Router();

router.get("/", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !(req.user as User).administrator) {
        res.redirect("/login");
        return;
    }

    if (!(req.user instanceof User)) {
        res.status(500);
        return;
    }
    const pageNumber: number = Number.parseInt((req.query.pageNumber as string)) || 1;
    console.log(pageNumber);

    const userCount: number = await User.count();
    const pageCount: number = Math.ceil(userCount / 10);

    const userList: User[] = await User.findAll({
        limit: 10,
        offset: (pageNumber - 1) * 10
    });
    
    res.render("admin/viewusers", {
        messages: req.flash(),
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        userList: userList,
        pageNumber: pageNumber,
        pageCount: pageCount
    });
});

router.get("/users/:userId/", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !(req.user as User).administrator) {
        res.redirect("/login");
        return;
    }

    if (!(req.user instanceof User)) {
        res.status(500);
        return;
    }
    
    const userToView: User = (await User.findAll({
        where: {
            id: req.params.userId
        }
    }))[0];

    res.render("admin/viewuser", {
        messages: req.flash(),
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        userToView: userToView
    });
});

router.route("/users/:userId/edit")
    .all(passport.authenticate("session"))
    .get(async (req: Request, res: Response) => {
        if (!req.isAuthenticated() || !(req.user as User).administrator) {
            res.redirect("/login");
            return;
        }
    
        if (!(req.user instanceof User)) {
            res.status(500);
            return;
        }
        
        const userToView: User = (await User.findAll({
            where: {
                id: req.params.userId
            }
        }))[0];

        if (req.user.id == userToView.id) {
            req.flash(FlashMessageType.WARNING, "You are editing your own profile!");
        }

        res.render("admin/edituser", {
            messages: req.flash(),
            isAuthenticated: req.isAuthenticated(),
            user: req.user,
            userToView: userToView
        })
    })
    .post(async (req: Request, res: Response) => {
        if (!req.isAuthenticated() || !(req.user as User).administrator) {
            res.redirect("/login");
            return;
        }
    
        if (!(req.user instanceof User)) {
            res.status(500);
            return;
        }

        // actually update the user's details
        const user: User = req.user;
        
        const userToUpdate: User = (await User.findAll({
            where: {
                id: req.params.userId
            }
        }))[0];

        if (req.body.firstName.length > 255){
            req.flash(FlashMessageType.DANGER, "The provided first name is too long.")
            res.redirect(`/admin/users/${req.params.userId}/edit`)
            return;
        }
        if (req.body.lastName.length > 255){
            req.flash(FlashMessageType.DANGER, "The provided last name is too long.")
            res.redirect(`/admin/users/${req.params.userId}/edit`)
            return;
        }
        if (req.body.email.length > 255){
            req.flash(FlashMessageType.DANGER, "The provided email is too long.")
            res.redirect(`/admin/users/${req.params.userId}/edit`)
            return;
        }
        if (req.body.phone.length > 255){
            req.flash(FlashMessageType.DANGER, "The provided phone number is too long.")
            res.redirect(`/admin/users/${req.params.userId}/edit`)
            return;
        }

        userToUpdate.firstName = req.body.firstName;
        userToUpdate.lastName = req.body.lastName;
        userToUpdate.email = req.body.email;
        userToUpdate.phone = req.body.phone;
        userToUpdate.active = req.body.isEnabled == "on";
        userToUpdate.administrator = req.body.isAdmin == "on";

        await userToUpdate.save()

        res.redirect("/admin/");
    });

router.get("/users/:userId/delete", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !(req.user as User).administrator) {
        res.redirect("/login");
        return;
    }

    if (!(req.user instanceof User)) {
        res.status(500);
        return;
    }

    const userToDelete: User | null = (await User.findAll({
        where: {
            id: Number(req.params.userId)
        }
    }))[0];

    if (userToDelete == null) {
        res.send("unknown user");
    }

    if (req.query.confirm == "true") {
        if (userToDelete.administrator) {
            req.flash(FlashMessageType.DANGER, "Administrator users cannot be deleted.")
        } else {
            await userToDelete.destroy();
            res.redirect("/admin/");
            return;
        }
    }

    if (req.user.id == userToDelete.id) {
        req.flash(FlashMessageType.WARNING, "You are attempting to delete your own profile!");
    }

    res.render("admin/deleteuser", {
        messages: req.flash(),
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        userToDelete: userToDelete
    });
});

router.get("/users/:userId/resetpassword", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !(req.user as User).administrator) {
        res.redirect("/login");
        return;
    }

    if (!(req.user instanceof User)) {
        res.status(500);
        return;
    }

    const userToReset: User | null = (await User.findAll({
        where: {
            id: Number(req.params.userId)
        }
    }))[0];

    if (req.query.confirm == "true") {
        const result = await sendPasswordResetEmail(userToReset);
        if (result) {
            req.flash(FlashMessageType.SUCCESS, "User has been sent a password reset email!");
            res.redirect("/admin/");
            return;
        } else {
            req.flash(FlashMessageType.DANGER, "Unable to send password reset email; check logs for more information.");
            res.redirect(`/admin/users/${userToReset.id}`);
            return;
        }
    }

    if (req.user.id == userToReset.id) {
        req.flash(FlashMessageType.WARNING, "You are attempting to reset your own password!");
    }

    res.render("admin/resetUserPassword", {
        messages: req.flash(),
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        userToReset: userToReset
    });
});

module.exports = router;