const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const NewUser = sequelize.define("NewUser", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
});

module.exports = NewUser;