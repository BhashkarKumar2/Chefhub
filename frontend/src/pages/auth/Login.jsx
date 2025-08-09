import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

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
      const response = await axios.post('https://chefhub.onrender.com/api/auth/login', credentials);
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
    window.location.href = 'https://chefhub.onrender.com/api/auth/google';
  };

  const handleFacebookLogin = () => {
    alert('Facebook login will be implemented soon');
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

      {/* Glassmorphism login card */}
      <div className="relative z-10 w-full max-w-md mx-auto rounded-2xl shadow-2xl bg-white/80 backdrop-blur-md border border-blue-200/40 p-8 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="ChefHub Logo" className="w-16 h-16 mb-2 drop-shadow" />
          <h1 className="text-3xl font-extrabold text-blue-700 mb-1 tracking-tight">ChefHub</h1>
          <p className="text-base text-gray-700 font-medium text-center">Sign in to book your next culinary experience</p>
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
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full p-3 bg-gradient-to-br from-blue-700 to-blue-400 text-white font-semibold rounded-lg shadow hover:shadow-lg transition"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="text-center my-4 text-gray-500 text-sm">or continue with</div>
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={handleGoogleLogin}
            className="p-2 border border-gray-300 rounded-full bg-white hover:shadow-md transition"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
              className="w-4 h-4"
            />
          </button>
          <button
            onClick={handleFacebookLogin}
            className="p-2 border border-gray-300 rounded-full bg-white hover:shadow-md transition"
          >
            <svg fill="#1877F2" height="20px" width="20px" viewBox="0 0 310 310">
              <path d="M81.703,165.106h33.981V305..." />
            </svg>
          </button>
        </div>
        <Link
          to="/mobile-login"
          className="w-full p-3 border border-blue-500 text-blue-600 font-semibold rounded-lg bg-white hover:bg-blue-50 flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 2H7c-1.1 0-2 .9..." />
          </svg>
          Sign in with Mobile Number
        </Link>
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
