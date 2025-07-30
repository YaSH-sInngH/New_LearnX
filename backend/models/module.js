import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Module = sequelize.define('Module', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    videoUrl: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    },
    duration: {
      type: DataTypes.INTEGER, // minutes
      allowNull: true
    },
    videoDuration: {
        type: DataTypes.INTEGER, // in seconds
        allowNull: true
    },
    videoStatus: {
        type: DataTypes.ENUM('processing', 'ready', 'failed'),
        defaultValue: 'processing'
    },
    videoProcessingJobId: {
        type: DataTypes.STRING,
        allowNull: true
    }
  }, {
    timestamps: true
  });

  export default Module;