import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const AIQuestion = sequelize.define('AIQuestion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  citations: {
    type: DataTypes.JSONB, // Array of citation objects
    defaultValue: []
  },
  moduleId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  trackId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  sourceType: {
    type: DataTypes.ENUM('transcript', 'notes', 'both'),
    defaultValue: 'both'
  },
  relevanceScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['moduleId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['trackId']
    }
  ]
});

export default AIQuestion; 