import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Quiz = sequelize.define('Quiz', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    questions: {
      type: DataTypes.JSONB, // Stores array of MCQ objects
      allowNull: false
    },
    passingScore: {
      type: DataTypes.INTEGER,
      defaultValue: 70
    }
  });

  export default Quiz;