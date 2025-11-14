import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

// Create Gmail transporter
const createEmailTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If an account exists with this email, a password reset link will be sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token and expiry to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    // Send email if Gmail is configured
    const transporter = createEmailTransporter();
    if (transporter) {
      try {
        const mailOptions = {
          from: `"ChefHub" <${process.env.GMAIL_USER}>`,
          to: user.email,
          subject: 'ChefHub - Password Reset Request',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f97316, #fb923c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; font-size: 28px; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
                .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f97316, #fb923c); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .button:hover { background: linear-gradient(135deg, #ea580c, #f97316); }
                .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
                .code { background: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-family: monospace; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>ChefHub</h1>
                </div>
                <div class="content">
                  <h2>Password Reset Request</h2>
                  <p>Hi ${user.name},</p>
                  <p>We received a request to reset your password for your ChefHub account. Click the button below to reset your password:</p>
                  
                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Your Password</a>
                  </div>
                  
                  <p>Or copy and paste this link into your browser:</p>
                  <p class="code">${resetUrl}</p>
                  
                  <div class="warning">
                    <strong>Important:</strong> This link will expire in <strong>10 minutes</strong> for security reasons.
                  </div>
                  
                  <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                  
                  <p>For security reasons, we never send your password via email.</p>
                  
                  <p>Best regards,<br>The ChefHub Team</p>
                </div>
                <div class="footer">
                  <p>This is an automated message from ChefHub. Please do not reply to this email.</p>
                  <p>&copy; ${new Date().getFullYear()} ChefHub. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `ChefHub - Password Reset Request

Hi ${user.name},

We received a request to reset your password for your ChefHub account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 10 minutes for security reasons.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The ChefHub Team`
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent to:', user.email);

        res.json({ 
          message: 'Password reset link has been sent to your email',
          success: true
        });
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError);
        
        // Fallback: Return reset URL in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 Development mode - Reset URL:', resetUrl);
          return res.json({ 
            message: 'Email service unavailable. Reset link generated.',
            resetUrl: resetUrl,
            success: true
          });
        }
        
        return res.status(500).json({ 
          message: 'Failed to send reset email. Please try again later.',
          success: false
        });
      }
    } else {
      // No Gmail configured - development mode
      console.log('📧 Gmail not configured. Reset URL:', resetUrl);
      res.json({ 
        message: 'Password reset link generated (email service not configured)',
        resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
        success: true
      });
    }
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify reset token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ 
      message: 'Password has been reset successfully',
      success: true
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    // console.error('Set password error:', error);
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
    // console.error('Change password error:', error);
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
    // console.error('Check password status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
