import { Sequelize } from "sequelize-typescript";

import { User } from "../Models/User";
import { Task } from "../Models/Task";
import { Event } from "../Models/Event";

const sequelize: Sequelize = new Sequelize("sqlite://app.db");

sequelize.addModels([ User, Task, Event ]);

sequelize.sync({ force: true });

module.exports = sequelize;