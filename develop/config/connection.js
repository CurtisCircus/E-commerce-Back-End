require('dotenv').config();
require('../.env.name').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PW,
  {
    host: process.env.DB_HOST || 'localhost', 
    dialect: 'mysql',
    dialectOptions: {
      decimalNumbers: true,
    },
    logging: console.log(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, process.env.DB_HOST),
  }
);

module.exports = sequelize;