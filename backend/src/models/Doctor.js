// import { DataTypes } from 'sequelize';
// import sequelize from '../config/db.js';

// const Doctor = sequelize.define('Doctor', {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//     validate: {
//       isEmail: true
//     }
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   phone: {
//     type: DataTypes.STRING,
//     allowNull: true
//   },
//   specialization: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   designation: {
//     type: DataTypes.STRING,
//     allowNull: true
//   },
//   yearsOfExperience: {
//     type: DataTypes.INTEGER,
//     allowNull: true
//   },
//   education: {
//     type: DataTypes.TEXT,
//     allowNull: true
//   },
//   certifications: {
//     type: DataTypes.JSON,
//     allowNull: true,
//     defaultValue: []
//   },
//   availableTimes: {
//     type: DataTypes.JSON,
//     allowNull: true
//   },
//   googleCalendarAccessToken: {
//     type: DataTypes.TEXT,
//     allowNull: true
//   },
//   googleCalendarRefreshToken: {
//     type: DataTypes.TEXT,
//     allowNull: true
//   },
//   googleCalendarTokenExpiry: {
//     type: DataTypes.DATE,
//     allowNull: true
//   },
//   googleCalendarConnected: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   },
//   role: {
//     type: DataTypes.STRING,
//     defaultValue: 'doctor'
//   }
// });

// export default Doctor;
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Doctor = sequelize.define(
  "Doctor",
  {
    name: { type: DataTypes.STRING, allowNull: false },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    password: { type: DataTypes.STRING, allowNull: true },

    phone: { type: DataTypes.STRING, allowNull: true },

    specialization: { type: DataTypes.STRING, allowNull: false },

    designation: { type: DataTypes.STRING, allowNull: true },

    yearsOfExperience: { type: DataTypes.INTEGER, allowNull: true },

    education: { type: DataTypes.TEXT, allowNull: true },

    certifications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    availableTimes: { type: DataTypes.JSON, allowNull: true },

    googleCalendarAccessToken: { type: DataTypes.TEXT, allowNull: true },
    googleCalendarRefreshToken: { type: DataTypes.TEXT, allowNull: true },
    googleCalendarTokenExpiry: { type: DataTypes.DATE, allowNull: true },
    googleCalendarConnected: { type: DataTypes.BOOLEAN, defaultValue: false },

    role: { type: DataTypes.STRING, defaultValue: "doctor" },
  },
  {
    tableName: "doctors",
  }
);

export default Doctor;
