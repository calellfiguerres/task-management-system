import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

import { User } from './User';
import { TaskPriority } from "./TaskPriority";

dayjs.extend(relativeTime) // use plugin

/**
 * A task that a user can have.
 */
@Table
export class Task extends Model {
    /**
     * The task's name.
     */
    @Column
    public name?: string;

    /**
     * The task's description.
     */
    @Column
    public description?: string;

    /**
     * Whether the task is completed (or not).
     */
    @Column
    public completed?: boolean;

    /**
     * The task's due date.
     */
    @Column
    public dueDate?: Date;

    /**
     * Formats the due date into a user friendy string.
     * 
     * @returns The due date as a formatted string.
     */
    public formattedDueDate(): string {
        // const currDate: Date = new Date();
        // if ((this.dueDate !=  null) && (Math.abs(this.dueDate.getMilliseconds() - currDate.getMilliseconds()) > 72 * 3600)) {
        //     return dayjs(this.dueDate).fromNow().toString();
        // } else {
            return dayjs(this.dueDate).format("MMMM D, YYYY h:mm A");
        // }
    }

    /**
     * Determines whether the task is overdue.
     * 
     * @returns Whether the task is overdue.
     */
    public isOverdue(): boolean | null {
        if (this.dueDate != null) {
            return (new Date()) > this.dueDate;
        } else {
            return null;
        }
    }

    /**
     * The task's priority
     */
    @Column
    public priority?: TaskPriority;

    /**
     * The `ID` of the user who owns this task.
     */
    @ForeignKey(() => User)
    @Column
    public taskOwnerId?: number;

    /**
     * The owner of this task.
     */
    @BelongsTo(() => User)
    public taskOwner?: User;
}