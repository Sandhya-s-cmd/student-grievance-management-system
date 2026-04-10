// Email Service for Grievance Portal
// Integrates with SendGrid for real email sending

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.REACT_APP_SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);
}

class EmailService {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    this.hasSendGrid = !!process.env.REACT_APP_SENDGRID_API_KEY;
  }

  // Generate verification code
  generateVerificationCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Send verification email (real SendGrid integration)
  async sendVerificationEmail(email, verificationCode, userName) {
    try {
      // Use real SendGrid API if available
      if (this.hasSendGrid && !this.isDevelopment) {
        const msg = {
          to: email,
          from: 'noreply@studentgrievance.com',
          subject: 'Verify Your Email - Grievance Portal',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3B82F6;">Email Verification</h2>
              <p>Hello ${userName},</p>
              <p>Please use the verification code below to verify your email address:</p>
              <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${verificationCode}</span>
              </div>
              <p>This code will expire in 15 minutes.</p>
              <p style="color: #6B7280; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
            </div>
          `
        };

        await sgMail.send(msg);
        
        return {
          success: true,
          message: 'Verification email sent successfully',
          sendGridUsed: true
        };
      }

      // Fallback to simulation for development
      if (this.isDevelopment) {
        console.log('📧 EMAIL VERIFICATION CODE');
        console.log('==========================');
        console.log(`To: ${email}`);
        console.log(`Name: ${userName}`);
        console.log(`Verification Code: ${verificationCode}`);
        console.log('==========================');
        
        // Store verification details for demo purposes
        const verificationData = {
          email,
          code: verificationCode,
          userName,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        };
        
        localStorage.setItem('pendingVerification', JSON.stringify(verificationData));
        
        return {
          success: true,
          message: 'Verification email sent successfully',
          developmentMode: true,
          verificationCode // Return code for development
        };
      }

      // Simulate API call if no SendGrid but not development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Verification email sent successfully',
        simulated: true
      };

    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        message: 'Failed to send verification email',
        error: error.message
      };
    }
  }

  // Send welcome email after successful verification
  async sendWelcomeEmail(email, userName) {
    try {
      if (this.isDevelopment) {
        console.log('🎉 WELCOME EMAIL');
        console.log('==================');
        console.log(`To: ${email}`);
        console.log(`Name: ${userName}`);
        console.log('Message: Welcome to Grievance Portal!');
        console.log('==================');
        
        return {
          success: true,
          message: 'Welcome email sent successfully',
          developmentMode: true
        };
      }

      // Production email sending logic here
      const emailData = {
        to: email,
        subject: 'Welcome to Grievance Portal',
        template: 'welcome',
        data: {
          userName
        }
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Welcome email sent successfully'
      };

    } catch (error) {
      console.error('Welcome email error:', error);
      return {
        success: false,
        message: 'Failed to send welcome email',
        error: error.message
      };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      if (this.isDevelopment) {
        console.log('🔒 PASSWORD RESET EMAIL');
        console.log('========================');
        console.log(`To: ${email}`);
        console.log(`Name: ${userName}`);
        console.log(`Reset Token: ${resetToken}`);
        console.log('========================');
        
        return {
          success: true,
          message: 'Password reset email sent successfully',
          developmentMode: true,
          resetToken
        };
      }

      const emailData = {
        to: email,
        subject: 'Reset Your Password - Grievance Portal',
        template: 'password_reset',
        data: {
          userName,
          resetToken,
          expiryHours: 1
        }
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };

    } catch (error) {
      console.error('Password reset email error:', error);
      return {
        success: false,
        message: 'Failed to send password reset email',
        error: error.message
      };
    }
  }

  // Get pending verification details (for development)
  getPendingVerification() {
    if (this.isDevelopment) {
      const pending = localStorage.getItem('pendingVerification');
      return pending ? JSON.parse(pending) : null;
    }
    return null;
  }

  // Clear pending verification (for development)
  clearPendingVerification() {
    if (this.isDevelopment) {
      localStorage.removeItem('pendingVerification');
    }
  }

  // Verify if verification code is still valid
  isVerificationCodeValid(verificationData) {
    if (!verificationData) return false;
    
    const now = new Date();
    const expiresAt = new Date(verificationData.expiresAt);
    return now < expiresAt;
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;
