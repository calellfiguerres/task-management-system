import express, { Request, Response, Router } from "express";
import passport from "passport";
import { User } from "../../Models/User";
import { Event } from "../../Models/Event";

const router: Router = express.Router();

function convertToUTC(date: Date): Date {
    return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
    ));
}

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
    // console.log(events);


    const fullCalenderEvents: any[] = [];
    events.forEach((event) => {
        fullCalenderEvents.push({
            title: event.name,
            start: event.startDate,
            end: event.endDate
        });
    });
    console.log(fullCalenderEvents);

    res.render('events/viewevents', {
        events: events,
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        fullCalenderEvents: fullCalenderEvents
    });
});

router.route("/new")
    .all(passport.authenticate("session"))
    .get(async (req: Request, res: Response) => {
        if (!req.isAuthenticated()) {
            res.redirect("/auth/login");
            return;
        }
        res.render("events/newevent", {isAuthenticated: req.isAuthenticated(), user: req.user});
    })
    .post(async (req: Request, res: Response) => {
        // console.log(req.body);
        if (!req.isAuthenticated()) {
            res.redirect("/auth/login");
            return;
        }
        if (req.body.name.length > 255){
            res.send("Your Event name was way too long!");
            return;
        }
        if (req.body.description.length > 255){
            res.send("Your Event description was too long");
            return;
        }

        const convertedStartDate: Date = new Date(req.body.startDate);
        if (convertedStartDate.toString() == "Invalid Date") {
            res.send("Your date is invalid");
            return;
        }
        const convertedEndDate: Date = new Date(req.body.endDate);
        if (convertedEndDate.toString() == "Invalid Date") {
            res.send("Your date is invalid");
            return;
        }

        // convertedDate.setMinutes(convertedDate.getMinutes() - convertedDate.getTimezoneOffset());
        // const utcDate: Date = Date.UTC(convertedDate.toUTCString())
        const utcStartDate: Date = convertToUTC(convertedStartDate);
        const utcEndDate: Date = convertToUTC(convertedEndDate);
        // console.log(utcDate);

        const e: Event = await Event.create({
            name: req.body.name,
            description: req.body.description,
            startDate: utcStartDate,
            endDate: utcEndDate
        });
        (req.user as User).addEvent(e);
        res.redirect("/events");
    });

module.exports = router;