// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const User = sequelize.define("User", {
//   name: DataTypes.STRING,
//   email: { type: DataTypes.STRING, unique: true },
//   password: DataTypes.STRING,
//   role: { type: DataTypes.STRING, defaultValue: "admin" }
// });

// module.exports = User;
// src/models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },

    role: { type: DataTypes.STRING, allowNull: false, defaultValue: "user" },

    // ✅ doctor fields
    specialization: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    licenseNo: { type: DataTypes.STRING, allowNull: true },
    roomNo: { type: DataTypes.STRING, allowNull: true },

    // ✅ force doctor to change password on first login
    mustChangePassword: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

export default User;
