import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "./User";
import { randomUUID } from "crypto";

@Table
export class PasswordResetToken extends Model {
    /**
     * The token for password reset.
     */
    @Column
    public token?: string;

    /**
     * Checks whether a given `token` matches the required token
     * 
     * @param token The token to check
     * @returns Whether the provided token matches the required token
     */
    public checkToken(token: string): boolean {
        return this.token == token;
    }

    /**
     * The ID of the user to reset.
     */
    @ForeignKey(() => User)
    @Column
    public userId?: number; 


    /**
     * The user to reset.
     */
    @BelongsTo(() => User)
    public user?: User;

    /**
     * The date and time at which the token becomes invalid.
     */
    @Column
    public expireDate?: Date;

    public static async createResetToken(user: User): Promise<PasswordResetToken> {
        const expireDate: Date = new Date();
        expireDate.setMilliseconds(expireDate.getMilliseconds() + (15 * 60 * 1000));

        const prt = await this.create({
            token: randomUUID(),
            expireDate: expireDate
        });
        
        user.addPasswordResetToken(prt);
        return prt;
    }
}