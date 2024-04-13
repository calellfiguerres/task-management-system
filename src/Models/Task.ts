import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from './User';

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
     * The `ID` of the user who owns this task.
     */
    @ForeignKey(() => User)
    @Column
    private taskOwnerId?: number;

    /**
     * The owner of this task.
     */
    @BelongsTo(() => User)
    public taskOwner?: User;
}