const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Doctor = sequelize.define("Doctor", {
  name: DataTypes.STRING,
  specialization: DataTypes.STRING,
  designation: DataTypes.STRING,
  availableTimes: DataTypes.JSON
});

module.exports = Doctor;
