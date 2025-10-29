import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { buildApiEndpoint, API_BASE_URL } from '../../utils/apiConfig';
import logo from '../../assets/logo.png';

const SignupNew = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(buildApiEndpoint('auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Could not sign up.');
      }
      navigate('/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Saffron Animated Background - Same as Home page */}
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
            <h1 className="text-3xl font-bold text-orange-900 mt-4 mb-2">Join ChefHub</h1>
            <p className="text-orange-700">Create your account and start your culinary journey</p>
          </div>

          {/* Signup Form Card */}
          <div className="bg-white/20 backdrop-blur-md border border-orange-200/30 rounded-2xl p-8 shadow-xl">

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder="Enter your full name"
                  onChange={handleChange}
                  value={formData.fullName}
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder="you@example.com"
                  onChange={handleChange}
                  value={formData.email}
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={passwordShown ? 'text' : 'password'}
                  required
                  className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-xl text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder="Create a strong password"
                  onChange={handleChange}
                  value={formData.password}
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
                <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  {passwordShown ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={confirmPasswordShown ? 'text' : 'password'}
                  required
                  className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-xl text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder="Confirm your password"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
                <button type="button" onClick={toggleConfirmPasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  {confirmPasswordShown ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-amber-100 border border-amber-300 text-amber-700 p-2 rounded mb-3 text-sm">
                {error}
              </div>
            )}

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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Social login */}
          <div className="text-center my-4 text-gray-500 text-sm">or continue with</div>
          <div className="flex justify-center gap-3 mb-4">
            <button onClick={handleGoogleSignup} className="p-2 border border-gray-300 rounded-full bg-white hover:shadow-md transition" title="Sign up with Google">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 font-medium mt-2">
            Already have an account? <Link to="/login" className="text-orange-800 font-semibold hover:text-orange-900 transition-colors duration-200">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
    </div>

  );
};

export default SignupNew;
