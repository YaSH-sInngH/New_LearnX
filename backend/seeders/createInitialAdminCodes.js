import { sequelize } from '../config/database.js';
import AdminInvitationCode from '../models/adminInvitationCode.js';
import User from '../models/user.js';

async function createInitialAdminCodes() {
  try {
    await sequelize.sync();

    // Find the first admin user to create codes
    const adminUser = await User.findOne({ where: { role: 'Admin' } });
    
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Create some initial invitation codes
    const codes = [
      { code: 'ADMIN2024', expiresInDays: 365 },
      { code: 'SUPERADMIN', expiresInDays: 365 },
      { code: 'PLATFORM_ADMIN', expiresInDays: 180 }
    ];

    for (const codeData of codes) {
      const expiresAt = new Date(Date.now() + codeData.expiresInDays * 24 * 60 * 60 * 1000);
      
      await AdminInvitationCode.create({
        code: codeData.code,
        createdBy: adminUser.id,
        expiresAt
      });
    }

    console.log('Initial admin invitation codes created successfully!');
    console.log('Codes:', codes.map(c => c.code).join(', '));
    
  } catch (error) {
    console.error('Error creating initial admin codes:', error);
  } finally {
    await sequelize.close();
  }
}

createInitialAdminCodes(); 