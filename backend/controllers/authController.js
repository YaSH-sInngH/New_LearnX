import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.js';
import AdminInvitationCode from '../models/adminInvitationCode.js';
import { generateToken } from '../utils/tokens.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emails.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, adminInvitationCode } = req.body;

    // Validate admin registration
    if (role === 'Admin') {
      if (!adminInvitationCode) {
        return res.status(400).json({ message: 'Admin invitation code is required for admin registration' });
      }
      
      // Check if invitation code exists and is valid
      const invitationCode = await AdminInvitationCode.findOne({
        where: {
          code: adminInvitationCode,
          isUsed: false,
          expiresAt: {
            [Op.or]: [null, { [Op.gt]: new Date() }]
          }
        }
      });

      if (!invitationCode) {
        return res.status(400).json({ message: 'Invalid or expired admin invitation code' });
      }
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      adminInvitationCode: role === 'Admin' ? adminInvitationCode : null
    });

    // Mark invitation code as used if admin registration
    if (role === 'Admin') {
      await AdminInvitationCode.update(
        { isUsed: true, usedBy: user.id },
        { where: { code: adminInvitationCode } }
      );
    }

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'Registered! Please verify your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) return res.status(400).json({ message: 'Invalid token' });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    console.log('User status:', user.status);
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Oops! You are banned! Try contacting the Admins.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email.' });

    const token = generateToken({ id: user.id, role: user.role, name: user.name });
    const { password: _password, ...userWithoutPassword } = user.toJSON();
    res.status(200).json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const resetToken = uuidv4();
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
      await user.save();
  
      await sendPasswordResetEmail(email, resetToken);
  
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Password reset failed' });
    }
};
  
export const resetPassword = async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      const user = await User.findOne({ 
        where: { 
          resetToken: token,
          resetTokenExpiry: { [Op.gt]: Date.now() } // Check if token is not expired
        } 
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
  
      res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Password reset failed' });
    }
};