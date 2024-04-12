import { DataTypes } from "sequelize";
import { IModel } from "./IModel";

const sequelize = require("./db");

const userTable = sequelize.define("Users", {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    username: { type: DataTypes.STRING, unique: true },
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING
});

/**
 * Possible arguments to use during user creation.
 */
interface UserInputArguments {
    id?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
}

/**
 * A user.
 */
export class User implements IModel {
    public id!: string | null;
    public firstName!: string | null;
    public lastName!: string | null;
    public username!: string | null;
    public email!: string | null;
    public phone!: string | null;
    private password!: string | null;

    public static userTable = userTable;
    private userTableRef: any;

    /**
     * Creates a new user.
     * 
     * @param args The arguments to use during user creation.
     */
    constructor(args?: UserInputArguments) {
        this.id = args?.id || null;
        this.firstName = args?.firstName || null;
        this.lastName = args?.lastName || null;
        this.username = args?.username || null;
        this.email = args?.email || null;
        this.phone = args?.phone || null;
        this.password = args?.password || null;
    }

    /**
     * Saves the user to the database.
     */
    public async save() {
        if (this.userTableRef == null) {
            this.userTableRef = await userTable.create(this);
        } else {
            await this.userTableRef.set(this);
        }
    }

    /**
     * Sets the user's password.
     * 
     * @param password The new password for the user.
     */
    public setPassword(password: string): void {
        this.password = password;
    }

    /**
     * Checks if a given password matches the user's password.
     * 
     * @param password The password to check.
     * @returns Whether the provided password was correct.
     */
    public checkPassword(password: string): boolean {
        return password === this.password;
    }

    public static async getUserByEmail(email: string): Promise<User | null> {
        const results = await userTable.findAll({
            where: {
                email: email
            }
        });

        console.log(results.length);

        return results.length > 0 ? new User(results[0]) : null;
    }

    /**
     * Gets a user from the database.
     * 
     * @param id The `ID` of the user to get.
     * @returns The user with the given `ID`, or null if they don't exist.
     */
    public static async getUserByID(id: number): Promise<User | null> {
        const results = await userTable.findAll({
            where: {
                id: id
            }
        });

        return results.length > 0 ? new User(results[0]) : null;
    }
}
