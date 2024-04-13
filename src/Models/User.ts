import { Table, Column, Model, HasMany, DataType, $GetType } from "sequelize-typescript";
import { Task } from "./Task";
import { Event } from "./Event";

/**
 * A user in the database.
 */
@Table
export class User extends Model {
    /**
     * The user's first name.
     */
    @Column
    public firstName?: string;

    /**
     * The user's last name.
     */
    @Column
    public lastName?: string;

    /**
     * The user's email.
     */
    @Column
    public email?: string;

    /**
     * The user's phone number.
     */
    @Column
    public phone?: string;

    /**
     * The list of tasks this user owns.
     */
    @HasMany(() => Task)
    public ownedTasks?: Task[];

    /**
     * Gets the list of tasks this user owns.
     * 
     * @returns The list of tasks this user owns.
     */
    public async getTasks(): Promise<$GetType<this["ownedTasks"]>> {
        return await this.$get("ownedTasks");
    }

    /**
     * Adds the given task to the list of tasks this user owns.
     * 
     * @param t The task to add.
     */
    public async addTask(t: Task): Promise<void> {
        await this.$add("ownedTasks", t);
    }

    /**
     * The list of events this user owns.
     */
    @HasMany(() => Task)
    public ownedEvents?: Event[];

    public async getEvents(): Promise<$GetType<this["ownedEvents"]>> {
        return await this.$get("ownedEvents");
    }

    public async addEvent(e: Event): Promise<void> {
        await this.$add("ownedEvents", e);
    }

    /**
     * The user's password.
     */
    @Column
    private password?: string;

    /**
     * Sets the user's password to the new `password`.
     * 
     * @param password The new password to use.
     */
    public setPassword(password: string): void {
        this.password = password;
    }

    /**
     * Checks whether a given password is the user's password.
     * 
     * @param password The password to check.
     * @returns Whether the provided `password` is correct.
     */
    public checkPassword(password: string): boolean {
        return this.password === password;
    }
}