import express, { Router, Request, Response } from "express";
import passport from "passport";
import { Task } from "../../Models/Task";
import { User } from "../../Models/User";
import { TaskPriority } from "../../Models/TaskPriority";
import { FlashMessageType } from "../FlashMessageType";

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

    taskList.forEach((t) => {
        console.log(t.name, t.dueDate);
    })

    const overdueTasks: Task[] = [];
    const completedTasks: Task[] = [];
    const tasks: Task[] = [];
    taskList.forEach((task) => {
        // console.log(task.toJSON());
        if (task.isOverdue()) {
            overdueTasks.push(task);
        } else if (task.completed == true) {
            completedTasks.push(task);
        } else {
            tasks.push(task);
        }
    });

    res.render('tasks/viewtasks', {
        messages: req.flash(),
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        overdueTasks: overdueTasks,
        completedTasks: completedTasks,
        tasks: tasks,
        sort: req.query.sort,
    });
});

router.route("/new")
    .all(passport.authenticate("session"))
    .get(async (req: Request, res: Response) => {
        if (!req.isAuthenticated()) {
            res.redirect("/auth/login");
            return;
        }
        res.render("tasks/newtask", {
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
        if (req.body.name.length > 255){
            req.flash(FlashMessageType.DANGER, "Your task name was way too long!");
            return;
        }
        if (req.body.description.length > 255){
            req.flash(FlashMessageType.DANGER, "Your task description was too long!");
            return;
        }
        const convertedDate: Date = new Date(req.body.dueDate);
        if (convertedDate.toString() == "Invalid Date") {
            req.flash(FlashMessageType.DANGER, "Your date was invalid!");
            return;
        }

        // convertedDate.setMinutes(convertedDate.getMinutes() - convertedDate.getTimezoneOffset());
        // const utcDate: Date = Date.UTC(convertedDate.toUTCString())
        const utcDate: Date = convertToUTC(convertedDate);
        console.log(utcDate);

        const t: Task = await Task.create({
            name: req.body.name,
            description: req.body.description,
            dueDate: utcDate,
            priority: req.body.priority
        });
        (req.user as User).addTask(t);

        req.flash(FlashMessageType.SUCCESS, `Successfully created task <u>${t.name}</u>!`)
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

    task.completed = true;
    await task.save();

    req.flash(FlashMessageType.SUCCESS, `Completed <u>${task.name}</u>! Congragulations!`);
    res.redirect("/tasks");
});

router.get("/:taskId/incomplete", passport.authenticate("session"), async (req: Request, res: Response) => {
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

    task.completed = false;
    await task.save();

    req.flash(FlashMessageType.SUCCESS, `<u>${task.name}</u> was marked incomplete.`);
    res.redirect("/tasks");
});

router.get("/:taskId/edit", passport.authenticate("session"), async (req: Request, res: Response) => {
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

    let date: Date | null = null;
    if (task.dueDate != null) {
        date = new Date(task.dueDate?.getTime());
        date.setMinutes(task.dueDate.getMinutes() - task.dueDate.getTimezoneOffset());
    }


    res.render('tasks/edit', {
        messages: req.flash(),
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        task: task,
        dateFillIn: date != null ? date.toISOString().slice(0,16) : false
    });
});

router.post("/:taskId/edit", passport.authenticate("session"), async (req: Request, res: Response) => {
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

    if (req.body.name.length > 255){
        req.flash(FlashMessageType.DANGER, "Your task name was too long!");
        res.redirect(`/tasks/${task.id}/edit`);
        return;
    }
    if (req.body.description.length > 255){
        req.flash(FlashMessageType.DANGER, "Your task description was too long!");
        res.redirect(`/tasks/${task.id}/edit`);
        return;
    }
    const convertedDate: Date = new Date(req.body.dueDate);
    if (convertedDate.toString() == "Invalid Date") {
        req.flash(FlashMessageType.DANGER, "Your task due date was invalid!");
        res.redirect(`/tasks/${task.id}/edit`);
        return;
    }
    task.name = req.body.name;
    task.description = req.body.description;
    task.dueDate = req.body.dueDate;
    task.priority = req.body.priority;

    await task.save()

    req.flash(FlashMessageType.SUCCESS, `Edited <u>${task.name}</u>.`);
    res.redirect("/tasks");
});

router.get("/:taskId/delete", passport.authenticate("session"), async (req: Request, res: Response) => {
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

    await Promise.all([
        user.removeTask(task),
        task.destroy()
    ]);

    req.flash(FlashMessageType.SUCCESS, `Deleted <u>${task.name}</u>.`);
    res.redirect("/tasks");
});

module.exports = router;