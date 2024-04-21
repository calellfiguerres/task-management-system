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
        userList: userList
    });
});

module.exports = router;