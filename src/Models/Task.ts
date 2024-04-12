import { DataTypes } from "sequelize";
import { IModel } from "./IModel";

const sequelize = require("./db");

const taskTable = sequelize.define("Tasks", {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    dueDate: DataTypes.DATE
});

/**
 * Possible arguments to use during task creation.
 */
interface TaskInputArguments {
    id?: string | null;
    name?: string | null;
    description?: string | null;
    dueDate?: Date | null;
}

/**
 * A task.
 */
export class Task implements IModel {
    public id!: string | null;
    public name!: string | null;
    public description?: string | null;
    public dueDate?: Date | null;

    public static taskTable = taskTable;
    private taskTableRef: any;

    /**
     * Creates a new task.
     * 
     * @param args The arguments to user during task creation.
     */
    constructor(args?: TaskInputArguments) {
        this.id = args?.id || null;
        this.name = args?.name || null;
        this.description = args?.description || null;
        this.dueDate = args?.dueDate || null;
    }

    /**
     * Saves the task to the database.
     */
    public async save(): Promise<void> {
        if (this.taskTableRef == null) {
            this.taskTableRef = await taskTable.create(this);
        } else {
            await this.taskTableRef.set(this);
        }
    }

    /**
     * Gets a task from the database.
     * 
     * @param id The `ID` of the user to get.
     * @returns The task with the given `ID`, or null if it doesn't exist.
     */
    public static async getTaskByID(id: number): Promise<Task | null> {
        const results = await this.taskTable.findAll({
            where: {
                id: id
            }
        });

        return results.length > 0 ? new Task(results[0]) : null;
    }   
}