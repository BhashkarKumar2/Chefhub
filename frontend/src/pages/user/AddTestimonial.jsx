import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useThemeAwareStyle } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AddTestimonial = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useThemeAwareStyle();
  
  const [formData, setFormData] = useState({
    rating: 5,
    testimonial: '',
    chefId: '',
    bookingId: ''
  });
  
  const [userInfo, setUserInfo] = useState(null);
  const [chefs, setChefs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a testimonial');
      navigate('/login');
      return;
    }
    
    fetchUserData();
  }, [isAuthenticated, token]);

  const fetchUserData = async () => {
    try {
      setFetchingData(true);
      
      // Fetch user profile
      const userResponse = await axios.get(`${API_URL}/api/user/profile/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInfo(userResponse.data);

      // Fetch user's bookings
      try {
        const bookingsResponse = await axios.get(`${API_URL}/api/bookings/user-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookingsResponse.data.filter(b => b.status === 'completed'));
      } catch (err) {
        console.log('Could not fetch bookings:', err.message);
      }

      // Fetch available chefs
      try {
        const chefsResponse = await axios.get(`${API_URL}/api/chefs`);
        setChefs(chefsResponse.data.chefs || []);
      } catch (err) {
        console.log('Could not fetch chefs:', err.message);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user information');
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.testimonial.trim()) {
      toast.error('Please write your testimonial');
      return;
    }

    if (formData.testimonial.length < 20) {
      toast.error('Testimonial must be at least 20 characters long');
      return;
    }

    if (formData.testimonial.length > 500) {
      toast.error('Testimonial cannot exceed 500 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/testimonials`,
        {
          rating: Number(formData.rating),
          testimonial: formData.testimonial.trim(),
          chefId: formData.chefId || undefined,
          bookingId: formData.bookingId || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(response.data.message || 'Testimonial submitted successfully!');
      
      // Reset form
      setFormData({
        rating: 5,
        testimonial: '',
        chefId: '',
        bookingId: ''
      });

      // Navigate to dashboard or home after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit testimonial';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <svg
              width="40"
              height="40"
              fill={star <= formData.rating ? '#f59e0b' : '#d1d5db'}
              viewBox="0 0 20 20"
              className="transition-colors duration-200"
            >
              <polygon points="10,1 12.59,7.36 19.51,7.36 13.96,11.64 16.55,18 10,13.72 3.45,18 6.04,11.64 0.49,7.36 7.41,7.36" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (fetchingData) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'} flex items-center justify-center lg:ml-20`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'} py-12 px-4 sm:px-6 lg:px-8 lg:ml-20`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Share Your Experience
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Help others discover amazing chefs by sharing your testimonial
          </p>
        </div>

        {/* User Info Card */}
        {userInfo && (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-6 mb-8 border`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-orange-500">
                <img
                  src={userInfo.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=f59e0b&color=fff&size=64`}
                  alt={userInfo.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=f59e0b&color=fff&size=64`;
                  }}
                />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userInfo.name}
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {[userInfo.city, userInfo.state, userInfo.country].filter(Boolean).join(', ') || 'India'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Testimonial Form */}
        <form onSubmit={handleSubmit} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-8 border`}>
          {/* Rating */}
          <div className="mb-8">
            <label className={`block text-center text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Rate Your Experience
            </label>
            {renderStars()}
            <p className={`text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {formData.rating} {formData.rating === 1 ? 'star' : 'stars'}
            </p>
          </div>

          {/* Testimonial Text */}
          <div className="mb-6">
            <label className={`block text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Your Testimonial *
            </label>
            <textarea
              name="testimonial"
              value={formData.testimonial}
              onChange={handleChange}
              rows="6"
              placeholder="Share your experience with ChefHub... (20-500 characters)"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
              required
            />
            <p className={`text-sm mt-2 ${
              formData.testimonial.length > 500 
                ? 'text-red-500' 
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {formData.testimonial.length} / 500 characters
            </p>
          </div>

          {/* Chef Selection (Optional) */}
          <div className="mb-6">
            <label className={`block text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Related to Chef (Optional)
            </label>
            <select
              name="chefId"
              value={formData.chefId}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
            >
              <option value="">Select a chef (optional)</option>
              {chefs.map((chef) => (
                <option key={chef._id} value={chef._id}>
                  {chef.name} - {chef.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Selection (Optional) */}
          {bookings.length > 0 && (
            <div className="mb-6">
              <label className={`block text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Related to Booking (Optional)
              </label>
              <select
                name="bookingId"
                value={formData.bookingId}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
              >
                <option value="">Select a booking (optional)</option>
                {bookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.chef?.name} - {new Date(booking.eventDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Info Box */}
          <div className={`${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg p-4 mb-6`}>
            <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-800'}`}>
              ✓ Your testimonial will be published immediately after submission and will be visible on the website.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                isDark
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.testimonial.length < 20 || formData.testimonial.length > 500}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                loading || formData.testimonial.length < 20 || formData.testimonial.length > 500
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                'Submit Testimonial'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTestimonial;
