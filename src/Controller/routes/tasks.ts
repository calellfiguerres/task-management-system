import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Task } from "../../Models/Task";
import { User } from "../../Models/User";
import { TaskPriority } from "../../Models/TaskPriority";

const router: Router = express.Router();

router.get("/", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user instanceof User) { // User IS authenticated

        const taskList: Task[] = await Task.findAll({
            where: {
                taskOwnerId: req.user.id
            },
            order: [
                req.query.sort == "priority" ? ["priority", "DESC"] : ["dueDate", "ASC"]
            ]
        });

        const overdueTasks: Task[] = [];
        const tasks: Task[] = [];
        taskList.forEach((task) => {
            if (task.isOverdue()) {
                overdueTasks.push(task);
            } else {
                tasks.push(task);
            }
        });

        res.render('tasks/viewtasks', {overdueTasks: overdueTasks, tasks: tasks})


    } else { // Someone not authenticated and trying to skip login
        res.redirect('/auth/login');
    }
});

router.get("/new", passport.authenticate("session"), async (req: Request, res: Response) => {
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
        res.redirect("/auth/login")
    }
});

router.get("/:taskId/complete", passport.authenticate("session"), async (req: Request, res: Response) => {
    res.send(req.params.taskId);
});

router.get("/:taskId/edit", passport.authenticate("session"), async (req: Request, res: Response) => {
    res.send(req.params.taskId);
});

router.get("/:taskId/delete", passport.authenticate("session"), async (req: Request, res: Response) => {
    res.send(req.params.taskId);
});

module.exports = router;