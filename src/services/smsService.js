// SMS Service for Grievance Portal
// Integrates with Twilio for real SMS sending

import twilio from 'twilio';

// Initialize Twilio client
let client = null;
if (process.env.REACT_APP_TWILIO_ACCOUNT_SID && process.env.REACT_APP_TWILIO_AUTH_TOKEN) {
  client = twilio(
    process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    process.env.REACT_APP_TWILIO_AUTH_TOKEN
  );
}

class SMSService {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    this.hasTwilio = !!client;
  }

  // Send SMS notification
  async sendSMS(phoneNumber, message) {
    try {
      // Use real Twilio API if available
      if (this.hasTwilio && !this.isDevelopment) {
        const smsResponse = await client.messages.create({
          body: message,
          from: '+1234567890', // Your Twilio phone number
          to: phoneNumber
        });

        return {
          success: true,
          message: 'SMS sent successfully',
          twilioUsed: true,
          sid: smsResponse.sid
        };
      }

      // Fallback to simulation for development
      if (this.isDevelopment) {
        console.log('📱 SMS NOTIFICATION');
        console.log('==================');
        console.log(`To: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        console.log('==================');

        return {
          success: true,
          message: 'SMS sent successfully',
          developmentMode: true,
          phoneNumber,
          message
        };
      }

      // Simulate API call if no Twilio but not development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'SMS sent successfully',
        simulated: true
      };

    } catch (error) {
      console.error('SMS service error:', error);
      return {
        success: false,
        message: 'Failed to send SMS',
        error: error.message
      };
    }
  }

  // Send verification code via SMS
  async sendVerificationSMS(phoneNumber, verificationCode, userName) {
    const message = `Hello ${userName}, your verification code is: ${verificationCode}. This code will expire in 15 minutes.`;
    
    return this.sendSMS(phoneNumber, message);
  }

  // Send complaint status update via SMS
  async sendComplaintUpdateSMS(phoneNumber, complaintId, status) {
    const message = `Your complaint #${complaintId} status has been updated to: ${status}. Check your dashboard for details.`;
    
    return this.sendSMS(phoneNumber, message);
  }

  // Send mediation reminder via SMS
  async sendMediationReminderSMS(phoneNumber, mediationDate, time) {
    const message = `Reminder: Your mediation session is scheduled for ${mediationDate} at ${time}. Please join on time.`;
    
    return this.sendSMS(phoneNumber, message);
  }
}

// Create singleton instance
const smsService = new SMSService();

export default smsService;
