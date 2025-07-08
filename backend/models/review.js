import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';


const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 1000]
      }
    }
  }, {
    timestamps: true
  });

  export default Review;