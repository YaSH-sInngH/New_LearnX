import { Achievement } from '../models/index.js';

const achievements = [
  {
    name: 'XP 100',
    description: 'Earn 100 XP',
    xpReward: 10,
    badgeImage: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
    criteria: { type: 'xp', amount: 100 }
  },
  {
    name: 'XP 300',
    description: 'Earn 300 XP',
    xpReward: 20,
    badgeImage: 'https://cdn-icons-png.flaticon.com/512/1828/1828885.png',
    criteria: { type: 'xp', amount: 300 }
  },
  {
    name: 'Track Finisher',
    description: 'Complete your first track',
    xpReward: 30,
    badgeImage: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
    criteria: { type: 'completed_tracks', count: 1 }
  },
  {
    name: 'Quiz Enthusiast',
    description: 'Attempt 5 quizzes',
    xpReward: 15,
    badgeImage: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    criteria: { type: 'quiz_attempts', count: 5 }
  }
];

export async function up() {
  for (const achievement of achievements) {
    await Achievement.findOrCreate({
      where: { name: achievement.name },
      defaults: achievement
    });
  }
  console.log('Initial achievements seeded.');
}

export async function down() {
  for (const achievement of achievements) {
    await Achievement.destroy({ where: { name: achievement.name } });
  }
  console.log('Initial achievements removed.');
} 