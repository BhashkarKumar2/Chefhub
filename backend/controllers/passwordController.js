import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Set password for OAuth users who don't have one
export const setPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const userId = req.user._id || req.user.id; // From auth middleware

    // Validate password
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has a password
    if (user.password) {
      return res.status(400).json({ 
        message: 'Password already exists. Use change password instead.' 
      });
    }

    // Hash and set password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      message: 'Password set successfully. You can now login with email and password.',
      success: true
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change existing password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id || req.user.id;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Current password, new password, and confirm password are required' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a password
    if (!user.password) {
      return res.status(400).json({ 
        message: 'No password set. Use set password instead.' 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      message: 'Password changed successfully',
      success: true
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user has a password set
export const checkPasswordStatus = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('password googleId facebookId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      hasPassword: !!user.password,
      isOAuthUser: !!(user.googleId || user.facebookId),
      canSetPassword: !user.password && !!(user.googleId || user.facebookId)
    });
  } catch (error) {
    console.error('Check password status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
