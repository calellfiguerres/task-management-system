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
    .post((req: Request, res: Response) => {
        if (!req.isAuthenticated() || !(req.user as User).administrator) {
            res.redirect("/login");
            return;
        }
    
        if (!(req.user instanceof User)) {
            res.status(500);
            return;
        }

        // actually update the user's details

        res.redirect("/admin/");
    });

module.exports = router;