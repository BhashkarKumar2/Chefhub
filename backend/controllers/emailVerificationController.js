import * as brevo from '@getbrevo/brevo';

// Names are user-supplied; never let them inject markup (e.g. phishing links) into our emails
export const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

// Send verification email with OTP using Brevo
export const sendVerificationEmail = async (user, verificationOTP) => {
  try {
    const fromEmail = process.env.BREVO_FROM_EMAIL;
    const fromName = process.env.BREVO_FROM_NAME || 'ChefHub';

    if (!fromEmail) {
      throw new Error('BREVO_FROM_EMAIL environment variable is required');
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email: user.email, name: user.name }];
    sendSmtpEmail.subject = '🔐 Verify Your ChefHub Account';
    sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
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
                Welcome to ChefHub, ${escapeHtml(user.name)}! 👋
              </h2>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Thank you for registering with ChefHub. Please use the verification code below to complete your registration:
              </p>
              
              <!-- Verification OTP -->
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #f97316, #fb923c); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);">
                  <p style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${verificationOTP}</p>
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
      `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[BREVO] Email sending failed:', error);
    throw error;
  }
};

// Send review reminder email after booking completion
export const sendReviewReminderEmail = async (userEmail, userName, chefName, bookingId) => {
  try {
    const fromEmail = process.env.BREVO_FROM_EMAIL;
    const fromName = process.env.BREVO_FROM_NAME || 'ChefHub';

    if (!fromEmail) {
      throw new Error('BREVO_FROM_EMAIL environment variable is required');
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email: userEmail, name: userName }];
    sendSmtpEmail.subject = '⭐ Rate Your Experience with ' + chefName;
    sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">
                🍽️ ChefHub
              </h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                Share Your Experience
              </p>
            </div>
            
            <!-- Content -->
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
                How was your experience, ${escapeHtml(userName)}? ⭐
              </h2>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Thank you for choosing <strong>${escapeHtml(chefName)}</strong> through ChefHub! We hope you had an amazing culinary experience.
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                Your feedback helps other food lovers find the perfect chef and helps chefs improve their services. You have <strong>48 hours</strong> to share your review.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/add-testimonial?bookingId=${bookingId}" 
                   style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f97316, #fb923c); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);">
                  ⭐ Write Your Review
                </a>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>⏰ Time Sensitive:</strong> You can submit your review within 48 hours of your booking completion. After that, the review window will expire.
                </p>
              </div>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                Best regards,<br>
                <strong style="color: #f97316;">The ChefHub Team</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #1f2937; padding: 20px 30px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                This is an automated email from ChefHub. Please do not reply directly to this message.
              </p>
              <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 12px;">
                © ${new Date().getFullYear()} ChefHub. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    // console.log('Review reminder email sent successfully to:', userEmail);

  } catch (error) {
    // console.error('Error sending review reminder email:', error);
    throw error;
  }
};
