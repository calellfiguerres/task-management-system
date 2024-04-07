import { DataTypes } from "sequelize";

const sequelize = require("./db");

const userTable = sequelize.define("Signer", {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING
});

/**
 * Possible arguments to use during user creation.
 */
interface UserInputArguments {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
}

/**
 * A user.
 */
export class User {
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
        this.firstName = args?.firstName || null;
        this.lastName = args?.lastName || null;
        this.username = args?.username || null;
        this.email = args?.email || null;
        this.phone = args?.phone || null;
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
        if (results.size == 0) {
            return null;
        } else {
            const resultToUse = results[0];
            return new User(resultToUse);
        }
    }

    /**
     * Creates a new user and saves it to the database.
     * 
     * @param args The arguments to give to user creation.
     * @returns The new user.
     */
    public static async create(args: UserInputArguments): Promise<User> {
        const newUser = new User(args);
        newUser.save();
        return newUser;
    }
}
