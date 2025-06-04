const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Property = sequelize.define('Property', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  features: {
    type: DataTypes.JSON, // Store as JSON array or string
    allowNull: true,
  },
  propertyType: {
    type: DataTypes.ENUM('sale', 'rent'),
    allowNull: false,
    defaultValue: 'sale',
  },
  status: {
    type: DataTypes.ENUM('available', 'sold', 'pending'),
    allowNull: false,
    defaultValue: 'available',
  },
  category: {
    type: DataTypes.ENUM('PG', 'Hostel', 'Room', 'Villa', 'Home'),
    allowNull: false,
    defaultValue: 'Home',
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  video: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Property;