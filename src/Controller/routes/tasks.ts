import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Task } from "../../Models/Task";
import { User } from "../../Models/User";

const router: Router = express.Router();

router.get("/", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user instanceof User) {
        res.send(await req.user.getTasks());
    }
});

router.get("/newtask", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        const t: Task = await Task.create({
            name: "test task",
            description: "test task description"
        });
        
        if (req.user instanceof User) {
            req.user.addTask(t);
        }
        res.send("success!");
    } else {
        res.send("Hello from tasks!");
    }
});

module.exports = router;