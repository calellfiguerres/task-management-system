import express, { Request, Response, Router } from "express";
import passport from "passport";
import { User } from "../../Models/User";
import { Event } from "../../Models/Event";

const router: Router = express.Router();

router.get("/", passport.authenticate("session"), async (req: Request, res: Response) => {
    
    if (!req.isAuthenticated()) { // Someone not authenticated and trying to skip login
        res.redirect('/auth/login');
        return;
    }
    if (!(req.user instanceof User)) {
        res.status(500).send("error");
        return;
    }

    const user: User = req.user;

    const events: Event[] = await Event.findAll({
        where: {
            eventOwnerId: req.user.id
        },
    });

    res.render('events/viewevents', {
        events: events,
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    });
});

module.exports = router;