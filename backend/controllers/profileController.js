import User from '../models/user.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase.js';
import sharp from 'sharp';
import { Achievement } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../public/uploads');

// Helper to clean expertise input
const sanitizeExpertise = (expertise) => {
  if (!expertise) return [];
  if (Array.isArray(expertise)) return expertise;
  if (typeof expertise === 'string') return expertise.split(',').map(item => item.trim());
  return [];
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const user = await User.findByPk(userId, {
      attributes: { 
        exclude: [
          'password', 
          'verificationToken', 
          'resetToken',
          'resetTokenExpiry'
        ] 
      },
      include: [
        { model: Achievement, as: 'achievements', through: { attributes: ['earnedAt'] } }
      ]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Format response
    const profile = {
      ...user.toJSON(),
      avatarUrl: user.avatarUrl || null,
      badges: user.achievements?.filter(a => a.badgeImage).map(a => a.badgeImage) || []
    };

    res.json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, expertise, level } = req.body;

    const updateData = {
      name,
      bio,
      expertise: sanitizeExpertise(expertise),
      level
    };

    await User.update(updateData, { where: { id: userId } });
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      ...updatedUser.toJSON(),
      avatarUrl: updatedUser.avatarUrl ||  null
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const uploadAvatar = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      // 1. Optimize image
      const optimizedImage = await sharp(req.file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();
  
      // 2. Generate unique filename
      const fileExt = '.webp';
      const fileName = `avatar_${uuidv4()}${fileExt}`;
  
      // 3. Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, optimizedImage, {
          contentType: 'image/webp',
          cacheControl: '3600', // 1 hour cache
          upsert: false
        });
  
      if (error) throw error;
  
      // 4. Construct public URL
      const avatarUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`;
  
      // 5. Update user record
      await User.update(
        { avatarUrl },
        { where: { id: req.user.id } }
      );
  
      res.json({ avatarUrl });
      
    } catch (err) {
      console.error('Avatar upload error:', err);
      res.status(500).json({ 
        error: 'Failed to upload avatar',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  };

export const getXPHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await XPEvent.findAll({
      where: { userId },
      order: [['date', 'DESC']]
    });
    res.json(events);
  } catch (err) {
    console.error('XP History error:', err);
    res.status(500).json({ error: 'Failed to fetch XP history' });
  }
};