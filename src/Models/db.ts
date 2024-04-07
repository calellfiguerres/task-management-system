const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("sqlite://app.db");

sequelize.sync({ force: true});

module.exports = sequelize;