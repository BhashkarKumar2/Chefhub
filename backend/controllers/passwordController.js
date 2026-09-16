import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as brevo from '@getbrevo/brevo';
import User from '../models/User.js';
import { escapeHtml } from './emailVerificationController.js';
import { signAuthToken } from '../auth/tokenService.js';
import { BCRYPT_ROUNDS, findUserByEmail, validatePassword } from '../auth/credentials.js';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await findUserByEmail(email);
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

    // Send email using Brevo
    try {
      const fromEmail = process.env.BREVO_FROM_EMAIL;
      const fromName = process.env.BREVO_FROM_NAME || 'ChefHub';

      if (!fromEmail) {
        throw new Error('BREVO_FROM_EMAIL environment variable is required');
      }

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = { name: fromName, email: fromEmail };
      sendSmtpEmail.to = [{ email: user.email, name: user.name }];
      sendSmtpEmail.subject = '🔐 Reset Your ChefHub Password';
      sendSmtpEmail.htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
              <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🍽️ ChefHub</h1>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin: 0 0 20px 0;">Password Reset Request</h2>
                <p>Hi ${escapeHtml(user.name)},</p>
                <p>We received a request to reset your password for your ChefHub account. Click the button below to reset your password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f97316, #fb923c); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Your Password</a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
                <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; word-break: break-all;">${resetUrl}</p>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 25px 0; border-radius: 0 6px 6px 0;">
                  <p style="margin: 0; font-weight: bold; color: #92400e; font-size: 14px;">
                    ⏰ Important: This link expires in <strong>10 minutes</strong>
                  </p>
                </div>
                
                <p style="font-size: 14px; color: #6b7280;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                
                <p>Best regards,<br>The ChefHub Team</p>
              </div>
              
              <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} ChefHub. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      // console.log('✅ Password reset email sent to:', user.email);

      // Same response as for an unknown email, so this can't be used to discover accounts
      res.json({ message: 'If an account exists with this email, a password reset link will be sent.' });
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);

      // SECURITY: Never expose reset tokens in API response
      // Log the URL for debugging but don't return it to client
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Development mode - Reset URL (for debugging only):', resetUrl);
      }

      return res.status(500).json({
        message: 'Failed to send reset email. Please try again later.',
        success: false
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

// Reset password. Also proves the user owns the email, so it marks it
// verified and signs out every existing session.
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex');
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Match and consume the token in one atomic update so it can't be used twice
    const user = await User.findOneAndUpdate(
      { resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } },
      {
        $set: { password: passwordHash, isEmailVerified: true, failedLoginAttempts: 0 },
        $unset: { resetPasswordToken: 1, resetPasswordExpire: 1, lockUntil: 1 },
        $inc: { tokenVersion: 1 }
      }
    );

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.json({
      message: 'Password has been reset successfully',
      success: true
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password (requires the current one). Signs out all other sessions
// and returns a fresh token for this one.
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id || req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'Current password, new password, and confirm password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await User.findById(userId).select('+password +tokenVersion');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({
        message: 'No password set. Use "Forgot password" to create one.'
      });
    }

    const isMatch = await bcrypt.compare(String(currentPassword), user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.json({
      message: 'Password changed successfully',
      success: true,
      token: signAuthToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check whether the account has a password (accounts from the old social
// logins may not, and set one through "Forgot password")
export const checkPasswordStatus = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ hasPassword: !!user.password });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
