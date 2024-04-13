import { Sequelize } from "sequelize-typescript";

import { User } from "./User";
import { Task } from "./Task";

const sequelize: Sequelize = new Sequelize("sqlite://app.db");

sequelize.addModels([ User, Task ]);

sequelize.sync({ force: true });

module.exports = sequelize;