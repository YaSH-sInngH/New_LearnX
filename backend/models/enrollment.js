import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Enrollment = sequelize.define('Enrollment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastAccessed: {
      type: DataTypes.DATE
    },
    completedModules: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        defaultValue: []
      },
      lastModuleId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      progressData: {
        type: DataTypes.JSONB,
        defaultValue: {} // { moduleId: { completed: bool, lastPosition: seconds } }
      }
  }, {
    timestamps: true
  });

  export default Enrollment;