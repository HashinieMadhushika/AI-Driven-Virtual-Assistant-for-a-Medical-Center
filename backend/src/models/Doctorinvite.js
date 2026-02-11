import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DoctorInvite = sequelize.define("DoctorInvite", {
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  tokenHash: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  usedAt: { type: DataTypes.DATE, allowNull: true },
});

export default DoctorInvite;
