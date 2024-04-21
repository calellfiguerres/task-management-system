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
     * Whether the account is active.
     */
    @Column
    public active?: boolean;

    /**
     * Whether the user is an admin.
     */
    @Column
    public administrator?: boolean;

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
     * Removes the given task from the list of tasks this user owns.
     * 
     * @param t The task to remove.
     */
    public async removeTask(t: Task): Promise<void> {
        await this.$remove("ownedTasks", t);
    }

    /**
     * Checks whether the calling `user` owns the given `task`.
     * 
     * @param task The task to check.
     * @returns Whether the user owns the given `task`.
     */
    public ownsTask(task: Task): boolean {
        return this.id == task.taskOwnerId;
    }

    /**
     * The list of events this user owns.
     */
    @HasMany(() => Event)
    public ownedEvents?: Event[];

    public async getEvents(): Promise<$GetType<this["ownedEvents"]>> {
        return await this.$get("ownedEvents");
    }

    /**
     * Adds an event to this user's events
     * 
     * @param e The event to add
     */
    public async addEvent(e: Event): Promise<void> {
        await this.$add("ownedEvents", e);
    }

    /**
     * Removes an event from this user's events
     * @param e The event to remove
     */
    public async removeEvent(e: Event): Promise<void> {
        await this.$remove("ownedEvents", e);
    }

    /**
     * Checks whether the calling `user` owns the given `event`
     * 
     * @param event The event to check
     * @returns Whether the user owns the given `event`
     */
    public ownsEvent(event: Event): boolean {
        return this.id === event.eventOwnerId;
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