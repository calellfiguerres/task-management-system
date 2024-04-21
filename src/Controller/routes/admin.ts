import express, { Router, Request, Response } from "express";
import passport from "passport";
import { User } from "../../Models/User";

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

    const userList: User[] = await User.findAll({
        limit: 10,
        offset: (pageNumber - 1) * 10
    });
    
    res.render("admin/viewusers", {
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        userList: userList,
        pageNumber: pageNumber
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

        res.render("admin/edituser", {
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
            res.send("Your first name was way too long!");
            return;
        }
        if (req.body.lastName.length > 255){
            res.send("Your last name was too long!");
            return;
        }
        if (req.body.email.length > 255){
            res.send("Your email was way too long!");
            return;
        }
        if (req.body.phone.length > 255){
            res.send("Your phone number was too long");
            return;
        }

        userToUpdate.firstName = req.body.firstName;
        userToUpdate.lastName = req.body.lastName;
        userToUpdate.email = req.body.email;
        userToUpdate.phone = req.body.phone;
        userToUpdate.active = req.body.isEnabled == "on";
        userToUpdate.administrator = req.body.isAdmin == "on";

        console.log(typeof req.body.isEnabled, req.body.isEnabled);
        console.log(typeof req.body.isAdmin, req.body.isAdmin);

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
            res.send("cannot delete admin");
            return;
        }

        await userToDelete.destroy();
        res.redirect("/admin/");
        return;
    } 

    res.render("admin/deleteuser", {
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        userToDelete: userToDelete
    });
});

module.exports = router;