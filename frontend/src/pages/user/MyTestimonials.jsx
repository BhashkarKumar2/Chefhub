import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useThemeAwareStyle } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyTestimonials = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useThemeAwareStyle();
  
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your testimonials');
      navigate('/login');
      return;
    }
    
    fetchMyTestimonials();
  }, [isAuthenticated, token]);

  const fetchMyTestimonials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/testimonials/user/my-testimonials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestimonials(response.data.testimonials || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load your testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Testimonial deleted successfully');
      setTestimonials(testimonials.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="20" height="20" fill={i < rating ? '#f59e0b' : '#d1d5db'} viewBox="0 0 20 20">
          <polygon points="10,1 12.59,7.36 19.51,7.36 13.96,11.64 16.55,18 10,13.72 3.45,18 6.04,11.64 0.49,7.36 7.41,7.36"/>
        </svg>
      ))}
    </div>
  );

  const getStatusBadge = (isApproved) => {
    if (isApproved) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          ✓ Approved
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
        ⏳ Pending Review
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              My Testimonials
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your submitted testimonials
            </p>
          </div>
          <button
            onClick={() => navigate('/add-testimonial')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
          >
            + Add New Testimonial
          </button>
        </div>

        {/* Testimonials List */}
        {testimonials.length === 0 ? (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-12 text-center border`}>
            <div className="text-6xl mb-4">📝</div>
            <h3 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              No Testimonials Yet
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Share your experience with ChefHub by creating your first testimonial
            </p>
            <button
              onClick={() => navigate('/add-testimonial')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Create Testimonial
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial._id}
                className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-6 border hover:shadow-xl transition-shadow`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-orange-500">
                      <img
                        src={testimonial.userProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.userName)}&background=f59e0b&color=fff&size=64`}
                        alt={testimonial.userName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.userName)}&background=f59e0b&color=fff&size=64`;
                        }}
                      />
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {testimonial.userName}
                      </h3>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {testimonial.userLocation}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(testimonial.isApproved)}
                </div>

                <div className="mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 italic`}>
                  "{testimonial.testimonial}"
                </p>

                {testimonial.chef && (
                  <div className={`${isDark ? 'bg-gray-700' : 'bg-orange-50'} rounded-lg p-3 mb-4`}>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="font-semibold">Related Chef:</span> {testimonial.chef.name}
                      {testimonial.chef.specialty && ` - ${testimonial.chef.specialty}`}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Submitted on {new Date(testimonial.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(testimonial._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTestimonials;
