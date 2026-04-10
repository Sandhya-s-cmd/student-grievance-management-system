import React, { useState, useEffect } from 'react';
import { 
  MailIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import emailService from '../services/emailService';

const EmailVerificationDisplay = ({ 
  email, 
  onVerificationComplete, 
  onResendEmail,
  isResending = false 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(null);

  useEffect(() => {
    // Check for pending verification in development mode
    const pending = emailService.getPendingVerification();
    if (pending && pending.email === email) {
      setPendingVerification(pending);
    }
  }, [email]);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email);

      if (!user) {
        setError('User not found');
        return;
      }

      if (user.verificationCode === verificationCode.toUpperCase()) {
        // Update user status
        user.emailVerified = true;
        user.status = 'active';
        user.verifiedAt = new Date().toISOString();
        
        const updatedUsers = users.map(u => u.email === email ? user : u);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        // Clear pending verification
        emailService.clearPendingVerification();

        // Send welcome email
        await emailService.sendWelcomeEmail(email, `${user.firstName} ${user.lastName}`);

        onVerificationComplete(user);
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (onResendEmail) {
      await onResendEmail();
    }
  };

  const formatTimeRemaining = () => {
    if (!pendingVerification) return '';
    
    const now = new Date();
    const expiresAt = new Date(pendingVerification.expiresAt);
    const timeDiff = expiresAt - now;
    
    if (timeDiff <= 0) return 'Expired';
    
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MailIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-gray-600">
          We've sent a verification code to<br />
          <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      {/* Development Mode Alert */}
      {pendingVerification && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800">Development Mode</h4>
              <p className="text-sm text-blue-600 mt-1">
                Verification code displayed below for testing:
              </p>
              <div className="mt-3 p-3 bg-blue-100 rounded-md">
                <p className="text-xs font-medium text-blue-800 mb-1">Your Code:</p>
                <p className="text-xl font-bold text-blue-900 tracking-wider">
                  {pendingVerification.code}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Expires in: {formatTimeRemaining()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            id="verificationCode"
            type="text"
            value={verificationCode}
            onChange={(e) => {
              setVerificationCode(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono tracking-wider"
            placeholder="Enter 6-digit code"
            maxLength={6}
          />
          {error && (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
        </div>

        <button
          onClick={handleVerify}
          disabled={isVerifying || !verificationCode.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verifying...
            </div>
          ) : (
            'Verify Email'
          )}
        </button>
      </div>

      {/* Help Section */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
        >
          Didn't receive the email?
        </button>

        {showInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Troubleshooting Tips:</h4>
            <ul className="text-xs text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Check your spam or junk folder
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Make sure the email address is correct
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Wait a few minutes for delivery
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                In development mode, check the code above
              </li>
            </ul>

            <button
              onClick={handleResend}
              disabled={isResending}
              className="mt-4 w-full flex items-center justify-center py-2 px-4 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Resending...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Resend Email
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationDisplay;
