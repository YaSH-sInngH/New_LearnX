import { User, Track, Module, Enrollment, Review } from '../models/index.js';
import { sequelize } from '../models/index.js';
import AdminInvitationCode from '../models/adminInvitationCode.js';
import { v4 as uuidv4 } from 'uuid';
import { notifyTrackApproval } from '../services/notificationService.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt', 'avatarUrl'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
    console.log(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['Admin', 'Creator', 'Learner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ role });
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const [userCount, trackCount, enrollmentCount, reviewCount] = await Promise.all([
      User.count(),
      Track.count(),
      Enrollment.count(),
      Review.count()
    ]);

    // Users by role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });

    // Daily active learners (last 30 days)
    const dailyActive = await sequelize.query(`
      SELECT 
        DATE("lastActiveDate") as date, 
        COUNT(DISTINCT id) as count
      FROM "Users"
      WHERE "lastActiveDate" >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date ASC
    `, { type: sequelize.QueryTypes.SELECT });

    // Popular categories
    const categories = await Track.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      order: [[sequelize.literal('count'), 'DESC']],
      raw: true
    });

    res.json({
      userCount,
      trackCount,
      enrollmentCount,
      reviewCount,
      avgRating: await Review.findOne({
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average']],
        raw: true
      }).then(r => parseFloat(r.average || 0).toFixed(2)),
      usersByRole,
      dailyActive,
      categories
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

export const manageTrack = async (req, res) => {
  try {
    const { action } = req.body;
    const track = await Track.findByPk(req.params.trackId);

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    switch (action) {
      case 'publish':
        await track.update({ isPublished: true });
        await notifyTrackApproval(track.creatorId, track.title, true);
        break;
      case 'unpublish':
        await track.update({ isPublished: false });
        break;
      case 'feature':
        // Implement featuring logic
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ message: `Track ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to manage track' });
  }
};

export const getAllTracks = async (req, res) => {
  try {
    const tracks = await Track.findAll({
      include: [{ model: User, as: 'Creator', attributes: ['id', 'name', 'avatarUrl'] }],
    });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tracks' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ status });
    res.json({ message: 'User status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// Generate admin invitation code
export const generateInvitationCode = async (req, res) => {
  try {
    const { expiresInDays = 30 } = req.body;
    const createdBy = req.user.id;

    const code = `ADMIN_${uuidv4().substring(0, 8).toUpperCase()}`;
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

    const invitationCode = await AdminInvitationCode.create({
      code,
      createdBy,
      expiresAt
    });

    res.status(201).json({
      message: 'Admin invitation code generated successfully',
      code: invitationCode.code,
      expiresAt: invitationCode.expiresAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate invitation code' });
  }
};

// Get all invitation codes
export const getInvitationCodes = async (req, res) => {
  try {
    const invitationCodes = await AdminInvitationCode.findAll({
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'usedByUser', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(invitationCodes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invitation codes' });
  }
};

// Delete invitation code
export const deleteInvitationCode = async (req, res) => {
  try {
    const { id } = req.params;

    const invitationCode = await AdminInvitationCode.findByPk(id);
    if (!invitationCode) {
      return res.status(404).json({ message: 'Invitation code not found' });
    }

    await invitationCode.destroy();
    res.status(200).json({ message: 'Invitation code deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete invitation code' });
  }
};