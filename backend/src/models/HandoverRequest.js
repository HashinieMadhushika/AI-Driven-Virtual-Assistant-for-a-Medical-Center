import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const HandoverRequest = sequelize.define(
  'HandoverRequest',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    firstName: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'Pending',
      validate: {
        isIn: [['Pending', 'Active', 'Resolved']],
      },
    },

    assignedAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'handover_requests',
    timestamps: true,
  }
);

export default HandoverRequest;
