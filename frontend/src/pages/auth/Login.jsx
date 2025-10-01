import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { buildApiEndpoint, API_BASE_URL } from '../../utils/apiConfig';
import logo from '../../assets/logo.png';
import { useThemeAwareStyle } from '../../utils/themeUtils';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { theme, isDark } = useThemeAwareStyle();

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(buildApiEndpoint('auth/login'), credentials);
      const { token, user } = response.data;

      // Use AuthContext login method
      login(token, {
        id: user.id,
        email: user.email,
        name: user.name
      });

      // Navigate to intended destination or dashboard
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/facebook`;
  };

  return (
  <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Saffron Animated Background - Same as Signup page */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,183,77,0.3),rgba(255,255,255,0))]"></div>
        {/* Floating Saffron Elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-orange-200/30 to-amber-300/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-gradient-to-r from-yellow-200/30 to-orange-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-amber-200/30 to-yellow-300/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-gradient-to-r from-orange-100/25 to-amber-200/25 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-80 h-80 bg-gradient-to-r from-yellow-100/25 to-orange-200/25 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-150 max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-300 to-amber-400 rounded-full blur-lg opacity-60 animate-pulse"></div>
              <img 
                src={logo} 
                alt="ChefHub Logo" 
                className="w-16 h-16 object-contain relative z-10 mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-16 h-16 flex items-center justify-center rounded-full text-xl font-bold relative z-10 mx-auto bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600" style={{display: 'none'}}>
                CH
              </div>
            </div>
            <h1 className="text-3xl font-bold text-orange-900 mt-4 mb-2">Welcome Back</h1>
            <p className="text-orange-700">Sign in to continue</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/20 backdrop-blur-md border border-orange-200/30 rounded-2xl p-8 shadow-xl">
            {error && (
              <div className="bg-amber-100 border border-amber-300 text-amber-700 p-2 rounded mb-3 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    required
                    className="w-full p-3 pl-10 border border-gray-300 rounded-xl text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="you@example.com"
                    value={credentials.email}
                    onChange={handleChange}
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                </div>
              </div>
              {/* Password */}
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-700">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="w-full p-3 pl-10 border border-gray-300 rounded-xl text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={handleChange}
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              {/* Submit */}
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            {/* Social login */}
            <div className="text-center my-4 text-gray-500 text-sm">or continue with</div>
            <div className="flex justify-center gap-3 mb-4">
              <button onClick={handleGoogleLogin} className="p-2 border border-gray-300 rounded-full bg-white hover:shadow-md transition" title="Sign in with Google">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="w-4 h-4" />
              </button>
              <button onClick={handleFacebookLogin} className="p-2 border border-gray-300 rounded-full bg-white hover:shadow-md transition" title="Sign in with Facebook">
                <svg fill="#FF9800" height="16px" width="16px" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <Link to="/mobile-login" className="p-2 border border-gray-300 rounded-full bg-white hover:shadow-md transition" title="Sign in with Mobile">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z"></path>
                </svg>
              </Link>
            </div>
            <p className="text-center text-sm text-gray-600 font-medium mt-2">
              Don't have an account? <Link to="/signup" className="text-orange-800 font-semibold hover:text-orange-900 transition-colors duration-200">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
