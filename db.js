const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('expense-full-stack', 'root', 'bhavya27465@', {
    host: 'localhost',
    dialect: 'mysql'
  });

module.exports=sequelize;