import 'dotenv/config';
import { User } from '../models/index.js';
import { checkAchievements } from '../services/gamificationServices.js';
import { sequelize } from '../config/database.js';

console.log('DATABASE_URL:', process.env.DATABASE_URL);

(async () => {
  await sequelize.sync();
  const users = await User.findAll();
  for (const user of users) {
    await checkAchievements(user.id);
    console.log(`Checked achievements for user: ${user.id}`);
  }
  console.log('All users checked for achievements!');
  process.exit();
})();
