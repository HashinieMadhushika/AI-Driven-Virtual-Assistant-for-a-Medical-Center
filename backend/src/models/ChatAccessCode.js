import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ChatAccessCode = sequelize.define('ChatAccessCode', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codeHash: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  requestedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'chat_access_codes',
  timestamps: false,
});

export default ChatAccessCode;