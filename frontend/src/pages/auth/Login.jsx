import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { buildApiEndpoint, API_BASE_URL } from '../../utils/apiConfig';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

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
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      {/* Background image with overlay */}
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80"
        alt="Chef cooking background"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
        style={{ filter: 'brightness(0.7) blur(2px)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-blue-900/60 z-0" />

      {/* Login card with fixed width to prevent stretching */}
      <div className="relative z-10 w-116 max-w-sm mx-auto px-4">
        {/* Glassmorphism login card */}
        <div className="rounded-2xl shadow-2xl bg-white/80 backdrop-blur-md border border-blue-200/40 p-6 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="ChefHub Logo" className="w-12 h-12 sm:w-16 sm:h-16 mb-2 drop-shadow" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-1 tracking-tight">ChefHub</h1>
          <p className="text-sm sm:text-base text-gray-700 font-medium text-center">Sign in to book your next culinary experience</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition-all"
              placeholder="you@example.com"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition-all"
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-600 p-2 rounded mb-3 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-br from-blue-700 to-blue-400 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="w-full">
          <div className="text-center my-4 text-gray-500 text-sm">or continue with</div>
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={handleGoogleLogin}
              className="p-3 sm:p-4 border border-gray-300 rounded-full bg-white hover:shadow-md transition-all hover:scale-105 min-h-[48px] min-w-[48px]"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                alt="Google"
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
            </button>
            <button
              onClick={handleFacebookLogin}
              className="p-3 sm:p-4 border border-gray-300 rounded-full bg-white hover:shadow-md transition-all hover:scale-105 min-h-[48px] min-w-[48px] flex items-center justify-center"
            >
              <svg fill="#1877F2" height="16px" width="16px" viewBox="0 0 310 310" className="sm:w-5 sm:h-5">
                <path d="M81.703,165.106h33.981V305c0,2.762,2.238,5,5,5h57.616c2.762,0,5-2.238,5-5V165.765h39.064c2.54,0,4.677-1.906,4.967-4.429l5.933-51.502c0.266-2.312-0.673-4.586-2.644-5.944c-1.971-1.359-4.564-1.218-6.388,0.351l-4.32,3.784h-42.63V84.389c0-10.337,8.396-18.732,18.732-18.732h23.897c2.762,0,5-2.238,5-5V5c0-2.762-2.238-5-5-5h-38.237c-32.383,0-58.732,26.349-58.732,58.732v37.091H81.703c-2.762,0-5,2.238-5,5v50.845C76.703,162.868,78.941,165.106,81.703,165.106z"/>
              </svg>
            </button>
          </div>
          <Link
            to="/mobile-login"
            className="w-full p-3 border border-blue-500 text-blue-600 font-semibold rounded-lg bg-white hover:bg-blue-50 transition-all hover:scale-105 flex items-center justify-center gap-2 mb-4"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 4h10v12H7V4zm5 15c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
            </svg>
            Sign in with Mobile Number
          </Link>
        </div>
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
