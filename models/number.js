const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const MobileNumber = sequelize.define("MobileNumber", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = MobileNumber;
