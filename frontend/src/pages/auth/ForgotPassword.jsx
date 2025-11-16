import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { buildApiEndpoint } from '../../utils/apiConfig';
import logo from '../../assets/logo.png';
import { useThemeAwareStyle } from '../../utils/themeUtils';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { theme, isDark } = useThemeAwareStyle();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(buildApiEndpoint('auth/forgot-password'), { email });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Saffron Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100'}`}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,183,77,0.3),rgba(255,255,255,0))]"></div>
        {/* Floating Saffron Elements */}
        <div className={`absolute top-1/4 left-1/4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${isDark ? 'bg-gradient-to-r from-orange-900/20 to-amber-900/20' : 'bg-gradient-to-r from-orange-200/30 to-amber-300/30'}`}></div>
        <div className={`absolute top-3/4 right-1/4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${isDark ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20' : 'bg-gradient-to-r from-yellow-200/30 to-orange-400/30'}`} style={{animationDelay: '2s'}}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${isDark ? 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20' : 'bg-gradient-to-r from-amber-200/30 to-yellow-300/30'}`} style={{animationDelay: '4s'}}></div>
        <div className={`absolute top-1/2 right-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse ${isDark ? 'bg-gradient-to-r from-orange-900/15 to-amber-900/15' : 'bg-gradient-to-r from-orange-100/25 to-amber-200/25'}`} style={{animationDelay: '1s'}}></div>
        <div className={`absolute bottom-1/3 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse ${isDark ? 'bg-gradient-to-r from-yellow-900/15 to-orange-900/15' : 'bg-gradient-to-r from-yellow-100/25 to-orange-200/25'}`} style={{animationDelay: '3s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-150 max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <img 
                src={logo} 
                alt="ChefHub Logo" 
                className="w-20 h-30 object-contain relative z-10 mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-16 h-16 flex items-center justify-center rounded-full text-xl font-bold relative z-10 mx-auto bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600" style={{display: 'none'}}>
                CH
              </div>
            </div>
            <h1 className={`text-3xl font-bold mt-4 mb-2 ${isDark ? 'text-orange-400' : 'text-orange-900'}`}>Forgot Password?</h1>
            <p className={isDark ? 'text-orange-300' : 'text-orange-700'}>No worries, we'll send you reset instructions</p>
          </div>

          {/* Form Card */}
          <div className={`backdrop-blur-md border rounded-2xl p-8 shadow-xl ${isDark ? 'bg-gray-800/40 border-gray-700/30' : 'bg-white/20 border-orange-200/30'}`}>
            {success ? (
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Check your email</h3>
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Link
                  to="/login"
                  className="inline-block w-full p-3 bg-gradient-to-br from-amber-700 to-amber-400 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-center"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className={`border p-3 rounded-lg mb-4 text-sm ${isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-300 text-red-700'}`}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        required
                        className={`w-full p-3 pl-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                      </svg>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-3 bg-gradient-to-br from-amber-700 to-amber-400 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
