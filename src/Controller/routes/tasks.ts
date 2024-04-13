import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Task } from "../../Models/Task";
import { User } from "../../Models/User";

const router: Router = express.Router();

// /tasks/ -> view your tasks
// /tasks/new -> create a nre task

router.get("/", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user instanceof User) { // User IS authenticated
        res.render('tasks/viewtasks', {tasks: await req.user.getTasks()})


    } else { // Someone not authenticated and trying to skip login
        res.redirect('/auth/login');
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

router.get("/")

module.exports = router;