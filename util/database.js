const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  'test_db', // Table
  'root', // username
  '12345', // password
  {
    dialect: 'mysql', // 사용 DB
    host: 'localhost' // Default
  });

module.exports = sequelize;
