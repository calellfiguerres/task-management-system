import { Table, Column, Model, HasMany, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";

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
     * The task's due date.
     */
    @Column
    public dueDate?: Date;

    /**
     * The `ID` of the owner who owns this task.
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