import express, { Request, Response, Router } from "express";
import passport from "passport";
import { User } from "../../Models/User";
import { Event } from "../../Models/Event";
import { FlashMessageType } from "../FlashMessageType";

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
            end: event.endDate,
            url: `/events/${event.id}/edit`
        });
    });
    console.log(fullCalenderEvents);

    res.render('events/viewevents', {
        messages: req.flash(),
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        events: events,
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
        res.render("events/newevent", {
            messages: req.flash(),
            isAuthenticated: req.isAuthenticated(),
            user: req.user
        });
    })
    .post(async (req: Request, res: Response) => {
        // console.log(req.body);
        if (!req.isAuthenticated()) {
            res.redirect("/auth/login");
            return;
        }
        if (req.body.name.length > 255) {
            req.flash(FlashMessageType.DANGER, "Your event name was too long!");
            return;
        }
        if (req.body.description.length > 255) {
            req.flash(FlashMessageType.DANGER, "Your event description was too long!");
            return;
        }

        const convertedStartDate: Date = new Date(req.body.startDate);
        if (convertedStartDate.toString() == "Invalid Date") {
            req.flash(FlashMessageType.DANGER, "Your event start date was invalid!");
            return;
        }
        const convertedEndDate: Date = new Date(req.body.endDate);
        if (convertedEndDate.toString() == "Invalid Date") {
            req.flash(FlashMessageType.DANGER, "Your event end date was too long!");
            return;
        }

        const utcStartDate: Date = convertToUTC(convertedStartDate);
        const utcEndDate: Date = convertToUTC(convertedEndDate);

        const e: Event = await Event.create({
            name: req.body.name,
            description: req.body.description,
            startDate: utcStartDate,
            endDate: utcEndDate
        });
        (req.user as User).addEvent(e);
        res.redirect("/events");
    });

router.route("/:eventId/edit")
    .all(passport.authenticate("session"))
    .get(async (req: Request, res: Response) => {
        if (!req.isAuthenticated()) {
            res.redirect("/auth/login");
            return;
        }
        if (!(req.user instanceof User)) {
            res.sendStatus(500);
            return;
        }

        const event: Event = (await Event.findAll({where:{id:req.params.eventId}}))[0];
        const user: User = req.user;

        if (!user.ownsEvent(event)) {
            req.flash(FlashMessageType.DANGER, "Unknown Event.");
            res.redirect("/events/");
            return;
        }
    
        let startDate: Date | null = null;
        if (event.startDate != null) {
            startDate = new Date(event.startDate?.getTime());
            startDate.setMinutes(event.startDate.getMinutes() - event.startDate.getTimezoneOffset());
        }

        let endDate: Date | null = null;
        if (event.endDate != null) {
            endDate = new Date(event.endDate?.getTime());
            endDate.setMinutes(event.endDate.getMinutes() - event.endDate.getTimezoneOffset());
        }


        res.render("events/edit", {
            messages: req.flash(),
            isAuthenticated: req.isAuthenticated(),
            user: req.user,
            event: event,
            startDateFillIn: startDate != null ? startDate.toISOString().slice(0,16) : false,
            endDateFillIn: endDate != null ? endDate.toISOString().slice(0,16) : false
        });
    })
    .post(async (req: Request, res: Response) => {
        if (!req.isAuthenticated()) {
            res.redirect("/auth/login");
            return;
        }
    
        if (!(req.user instanceof User)) {
            res.sendStatus(500);
            return;
        }
    
        const user: User = req.user;
        const event: Event = (await Event.findAll({where:{id:req.params.eventId}}))[0];
    
        if (req.body.name.length > 255){
            req.flash(FlashMessageType.DANGER, "Your event name was too long!");
            res.redirect(`/events/${event.id}/edit`)
            return;
        }
        if (req.body.description.length > 255){
            req.flash(FlashMessageType.DANGER, "Your event description was too long!");
            res.redirect(`/events/${event.id}/edit`)
            return;
        }
        const convertedStartDate: Date = new Date(req.body.startDate);
        if (convertedStartDate.toString() == "Invalid Date") {
            req.flash(FlashMessageType.DANGER, "Your event start date was invalid!");
            res.redirect(`/events/${event.id}/edit`)
            return;
        }
        const convertedEndDate: Date = new Date(req.body.endDate);
        if (convertedEndDate.toString() == "Invalid Date") {
            req.flash(FlashMessageType.DANGER, "Your event end date was invalid!");
            res.redirect(`/events/${event.id}/edit`)
            return;
        }
        event.name = req.body.name;
        event.description = req.body.description;
        event.startDate = req.body.startDate;
        event.endDate = req.body.endDate;
    
        await event.save()
    
        req.flash(FlashMessageType.SUCCESS, `Edited <u>${event.name}</u>.`);
        res.redirect("/events");
    });

    router.get("/:eventId/delete", passport.authenticate("session"), async (req: Request, res: Response) => {
        if (!req.isAuthenticated()) {
            res.redirect("/auth/login");
            return;
        }
    
        if (!(req.user instanceof User)) {
            res.sendStatus(500);
            return;
        }
    
        const user: User = req.user;
        const event: Event = (await Event.findAll({where:{id:req.params.eventId}}))[0];
        
        if (!user.ownsEvent(event)) {
            res.status(404).send("not found")
            return;
        }
    
        await Promise.all([
            user.removeEvent(event),
            event.destroy()
        ]);
    
        req.flash(FlashMessageType.SUCCESS, `Deleted <u>${event.name}</u>.`);
        res.redirect("/events");
    });

module.exports = router;