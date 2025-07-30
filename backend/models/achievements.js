import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Achievement = sequelize.define('Achievement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    xpReward: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    badgeImage: {
      type: DataTypes.STRING
    },
    criteria: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  });

  export default Achievement;