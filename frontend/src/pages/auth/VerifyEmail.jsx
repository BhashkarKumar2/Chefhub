import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Mail, RefreshCcw } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-email/${token}`);
        const data = await response.json();

        if (data.success) {
          setVerificationState('success');
          setMessage(data.message || 'Email verified successfully!');
          
          // Start countdown for redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/login');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else {
          setVerificationState('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationState('error');
        setMessage('Network error. Please try again.');
      }
    };

    if (token) {
      verifyToken();
    } else {
      setVerificationState('error');
      setMessage('Invalid verification link');
    }
  }, [token, navigate]);

  const handleRetryLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = () => {
    navigate('/register');
  };

  const renderContent = () => {
    switch (verificationState) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6 animate-pulse">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying Your Email
            </h1>
            <p className="text-gray-600 mb-6">
              Please wait while we verify your email address...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Email Verified Successfully! ✅
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-sm mb-2">
                🎉 Your ChefHub account is now active!
              </p>
              <p className="text-green-600 text-sm">
                Redirecting to login in <span className="font-bold">{countdown}</span> seconds...
              </p>
            </div>
            <button
              onClick={handleRetryLogin}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Go to Login Now
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Failed ❌
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm mb-2">
                ⏰ This verification link may have expired (2-minute limit)
              </p>
              <p className="text-red-600 text-sm">
                Please register again to receive a new verification email.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Register Again
              </button>
              <button
                onClick={handleRetryLogin}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-orange-100">
        {/* ChefHub Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mb-4">
            <span className="text-2xl">🍽️</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            ChefHub
          </h2>
        </div>

        {renderContent()}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            Need help? Contact{' '}
            <a href="mailto:support@chefhub.com" className="text-orange-600 hover:text-orange-700 font-medium">
              support@chefhub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;