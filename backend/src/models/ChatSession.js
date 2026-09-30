import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ChatSession = sequelize.define('ChatSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'floating-chat',
  },
}, {
  tableName: 'chat_sessions',
  timestamps: true,
});

export default ChatSession;