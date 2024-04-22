import { Sequelize } from "sequelize-typescript";

import { User } from "../Models/User";
import { Task } from "../Models/Task";
import { Event } from "../Models/Event";
import { PasswordResetToken } from "../Models/PasswordResetToken";

const sequelize: Sequelize = new Sequelize("sqlite://app.db");

sequelize.addModels([ User, Task, Event, PasswordResetToken ]);

sequelize.sync({ force: false });

module.exports = sequelize;