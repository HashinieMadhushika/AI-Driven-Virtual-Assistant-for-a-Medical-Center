import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const MedicalDocument = sequelize.define(
  'MedicalDocument',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    patientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    firstName: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    documentType: {
      type: DataTypes.STRING(40),
      allowNull: false,
      validate: {
        isIn: [[
          'PRESCRIPTION',
          'MEDICAL_REPORT',
          'LAB_REPORT',
          'OTHER_MEDICAL_DOCUMENT',
        ]],
      },
    },

    originalFileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    storageBucket: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    storagePath: {
      type: DataTypes.STRING(700),
      allowNull: false,
      unique: true,
    },

    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'UPLOADED',
      validate: {
        isIn: [['UPLOADED', 'REVIEWED', 'ARCHIVED']],
      },
    },

    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'medical_documents',
    timestamps: true,
  }
);

export default MedicalDocument;
