import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Task } from "../../Models/Task";
import { User } from "../../Models/User";
import { TaskPriority } from "../../Models/TaskPriority";

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

    res.render('tasks/viewtasks', {overdueTasks: overdueTasks, tasks: tasks, sort: req.query.sort, isAuthenticated: req.isAuthenticated(), user: req.user})
});

router.route("/new")
    .all(passport.authenticate("session"))
    .get(async (req: Request, res: Response) => {
        if (!req.isAuthenticated()) {
            res.redirect("/auth/login");
            return;
        }
        res.render("tasks/newtask", {isAuthenticated: req.isAuthenticated(), user: req.user});
    })
    .post(async (req: Request, res: Response) => {
        // console.log(req.body);
        if (!req.isAuthenticated()) {
            res.redirect("/auth/login");
            return;
        }
        if (req.body.name.length > 255){
            res.send("Your task name was way too long!");
            return;
        }
        if (req.body.description.length > 255){
            res.send("Your task description was too long");
            return;
        }
        const convertedDate: Date = new Date(req.body.dueDate);
        if (convertedDate.toString() == "Invalid Date") {
            res.send("Your date is invalid");
        }
        const t: Task = await Task.create({
            name: req.body.name,
            description: req.body.description,
            dueDate: convertedDate,
            priority: req.body.priority
        });
        (req.user as User).addTask(t);
        res.redirect("/tasks");
    });

router.get("/:taskId/complete", passport.authenticate("session"), async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
        res.redirect("/auth/login");
        return;
    }

    if (!(req.user instanceof User)) {
        res.sendStatus(500);
        return;
    }

    const user: User = req.user;
    const task: Task = (await Task.findAll({where:{id:req.params.taskId}}))[0];
    
    if (!user.ownsTask(task)) {
        res.status(404).send("not found")
        return;
    }

    // complete the task.
});

router.get("/:taskId/edit", passport.authenticate("session"), async (req: Request, res: Response) => {
    res.send(req.params.taskId);
});

router.get("/:taskId/delete", passport.authenticate("session"), async (req: Request, res: Response) => {
    res.send(req.params.taskId);
});

module.exports = router;