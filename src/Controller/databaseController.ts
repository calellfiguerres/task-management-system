import { Sequelize } from "sequelize-typescript";

import { User } from "../Models/User";
import { Task } from "../Models/Task";

const sequelize: Sequelize = new Sequelize("sqlite://app.db");

sequelize.addModels([ User, Task ]);

sequelize.sync({ force: true });

module.exports = sequelize;