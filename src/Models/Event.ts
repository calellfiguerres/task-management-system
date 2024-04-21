import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "./User";

/**
 * An event that a user can have.
 */
@Table
export class Event extends Model {
    /**
     * The event's name.
     */
    @Column
    public name?: string;

    /**
     * The event's description.
     */
    @Column
    public description?: string;

    /**
     * The event's start date and time.
     */
    @Column
    public startDate?: Date;

    /**
     * The event's end date and time.
     */
    @Column
    public endDate?: Date;

    /**
     * The `ID` of the user who owns this event.
     */
    @ForeignKey(() => User)
    @Column
    public eventOwnerId?: number;

    /**
     * The owner of this event.
     */
    @BelongsTo(() => User)
    public eventOwner?: User;
}