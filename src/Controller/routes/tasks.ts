import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Task } from "../../Models/Task";
import { User } from "../../Models/User";
import { TaskPriority } from "../../Models/TaskPriority";
import { Sequelize } from "sequelize-typescript";

const router: Router = express.Router();

// /tasks/ -> view your tasks
// /tasks/new -> create a nre task

router.get("/", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user instanceof User) { // User IS authenticated

        let taskList: Task[] = [];
        
        if (req.query.sort == "priority") {
            taskList = await Task.findAll({
                where: {
                    taskOwnerId: req.user.id
                },
                order: [
                    ["priority", "DESC"]
                ]
            });
        } else {
            taskList = await Task.findAll({
                where: {
                    taskOwnerId: req.user.id
                },
                order: [
                    ["dueDate", "ASC"]
                ]
            });
        }

        res.render('tasks/viewtasks', {tasks: taskList})


    } else { // Someone not authenticated and trying to skip login
        res.redirect('/auth/login');
    }
});

router.get("/newtask0", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        const t: Task = await Task.create({
            name: "test task",
            description: "test task description",
            dueDate: new Date(),
            priority: TaskPriority.LOW
        });
        
        if (req.user instanceof User) {
            req.user.addTask(t);
        }
        res.send("success!");
    } else {
        res.send("Hello from tasks!");
    }
});

router.get("/newtask1", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        const t: Task = await Task.create({
            name: "test task",
            description: "test task description",
            dueDate: new Date(),
            priority: TaskPriority.MEDIUM
        });
        
        if (req.user instanceof User) {
            req.user.addTask(t);
        }
        res.send("success!");
    } else {
        res.send("Hello from tasks!");
    }
});

router.get("/newtask2", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        const t: Task = await Task.create({
            name: "test task",
            description: "test task description",
            dueDate: new Date(),
            priority: TaskPriority.HIGH
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