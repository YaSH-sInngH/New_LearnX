import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Discussion = sequelize.define('Discussion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trackId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    moduleId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    }
  }, { timestamps: true });

  export default Discussion;