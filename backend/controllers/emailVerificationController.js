import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { getPendingRegistration, deletePendingRegistration, storePendingRegistration, pendingRegistrations } from '../auth/authController.js';

// Create Gmail transporter for verification emails
const createEmailTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    // console.log('⚠️ Gmail credentials not configured. Email sending disabled.');
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

// Send verification email with OTP
export const sendVerificationEmail = async (user, verificationOTP) => {
  const emailId = Math.random().toString(36).substring(7);
  const stack = new Error().stack;
  // console.log(`[EMAIL-${emailId}] Sending verification OTP to ${user.email} at ${new Date().toISOString()}`);
  // console.log(`[EMAIL-${emailId}] OTP: ${verificationOTP}`);
  // console.log(`[EMAIL-${emailId}] Called from:`, stack.split('\n')[2].trim());
  
  const transporter = createEmailTransporter();
  if (!transporter) {
    throw new Error('Email service not configured');
  }
  
  const mailOptions = {
    from: `"ChefHub" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: 'ChefHub - Verify Your Email Address',
    headers: {
      'X-Email-ID': emailId,
      'X-OTP': verificationOTP
    },
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">
              🍽️ ChefHub
            </h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
              Your Culinary Journey Awaits
            </p>
          </div>
          
          <!-- Content -->
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
              Welcome to ChefHub, ${user.name}! 👋
            </h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
              Thank you for registering with ChefHub. Please use the verification code below to complete your registration:
            </p>
            
            <!-- Verification OTP -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #f97316, #fb923c); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);">
                <p style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${verificationOTP}</p>
              </div>
            </div>
            
            <p style="margin: 20px 0; font-size: 14px; color: #6b7280; text-align: center;">
              Enter this code on the verification page to activate your account.
            </p>
            
            <!-- Warning Box -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 25px 0; border-radius: 0 6px 6px 0;">
              <p style="margin: 0; font-weight: bold; color: #92400e; font-size: 14px;">
                ⏰ Important: This verification code expires in <strong>10 minutes</strong>
              </p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #92400e;">
                If you don't verify within this time, you'll need to register again.
              </p>
            </div>
            
            <p style="margin: 25px 0 0 0; font-size: 14px; color: #6b7280;">
              If you didn't create an account with ChefHub, you can safely ignore this email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 25px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280;">
              Need help? Contact us at support@chefhub.com
            </p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              © ${new Date().getFullYear()} ChefHub. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
  // console.log(`[EMAIL-${emailId}] ✅ Verification email sent successfully to ${user.email}`);
};

// Verify email OTP and create user
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // console.log(`[VERIFY] Received verification request for ${email} with OTP: ${otp}`);

    if (!email || !otp) {
      // console.log(`[VERIFY] ❌ Missing email or OTP`);
      return res.status(400).json({ 
        success: false,
        message: 'Email and OTP are required' 
      });
    }

    // Get pending registration data from Redis (or fallback to in-memory)
    let pendingData;
    try {
      pendingData = await getPendingRegistration(email);
    } catch (redisError) {
      // console.warn(`[REDIS] Failed, using in-memory fallback:`, redisError.message);
      pendingData = pendingRegistrations.get(email);
    }
    
    if (!pendingData) {
      // console.log(`[VERIFY] ❌ No pending registration found for ${email}`);
      return res.status(400).json({ 
        success: false,
        message: 'No pending registration found. Please register again.'
      });
    }

    // Check if OTP expired
    if (pendingData.expiresAt < Date.now()) {
      try {
        await deletePendingRegistration(email);
      } catch {
        pendingRegistrations.delete(email);
      }
      // console.log(`[VERIFY] ⏰ OTP expired for ${email}`);
      return res.status(400).json({ 
        success: false,
        message: 'OTP has expired. Please register again.',
        expired: true
      });
    }

    // Hash the entered OTP and compare
    const hashedOTP = crypto.createHash('sha256').update(otp.toString()).digest('hex');
    
    if (hashedOTP !== pendingData.otp) {
      // console.log(`[VERIFY] ❌ Incorrect OTP entered for ${email}`);
      return res.status(400).json({ 
        success: false,
        message: 'Incorrect OTP. Please check your email and try again.'
      });
    }

    // OTP is correct - Now create the user in database
    // console.log(`[VERIFY] ✅ OTP verified for ${email}, creating user in database...`);
    
    const newUser = new User({
      name: pendingData.name,
      email: pendingData.email,
      password: pendingData.password,
      isEmailVerified: true // User is verified since OTP matched
    });
    
    await newUser.save();
    
    // Remove from pending registrations (Redis or in-memory)
    try {
      await deletePendingRegistration(email);
    } catch {
      pendingRegistrations.delete(email);
    }
    
    // console.log(`[VERIFY] ✅ User created successfully for ${email}`);
    
    res.json({ 
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    // console.error('❌ Email verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during verification' 
    });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // console.log(`[RESEND] Resend OTP requested for ${email}`);

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email address is required' 
      });
    }

    // Check if there's a pending registration (Redis or in-memory)
    let pendingData;
    try {
      pendingData = await getPendingRegistration(email);
    } catch (redisError) {
      // console.warn(`[REDIS] Failed, using in-memory fallback:`, redisError.message);
      pendingData = pendingRegistrations.get(email);
    }
    
    if (!pendingData) {
      // console.log(`[RESEND] ❌ No pending registration for ${email}`);
      return res.status(404).json({ 
        success: false,
        message: 'No pending registration found. Please register again.' 
      });
    }

    // Generate new OTP (6-digit, 10-minute expiry)
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto.createHash('sha256').update(verificationOTP).digest('hex');

    // Update pending registration with new OTP (Redis or in-memory)
    pendingData.otp = hashedOTP;
    pendingData.expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    try {
      await storePendingRegistration(email, pendingData);
    } catch (redisError) {
      // console.warn(`[REDIS] Failed, using in-memory fallback:`, redisError.message);
      pendingRegistrations.set(email, pendingData);
    }

    // Send new verification email
    await sendVerificationEmail({ name: pendingData.name, email }, verificationOTP);

    // console.log(`[RESEND] ✅ New OTP sent to ${email}`);

    res.json({ 
      success: true,
      message: 'New verification code sent! Please check your email.' 
    });

  } catch (error) {
    // console.error('❌ Error resending verification email:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to resend verification email' 
    });
  }
};