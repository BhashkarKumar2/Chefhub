import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useThemeAwareStyle } from '../../utils/themeUtils';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { getClass, isDark } = useThemeAwareStyle();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchMyBookings();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token available');
        setLoading(false);
        return;
      }
      
      // Use the general bookings endpoint like Dashboard does
      const response = await api.get('/bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filterBookings = () => {
    const now = new Date();
    if (filter === 'upcoming') {
      return bookings.filter(b => 
        new Date(b.date) >= now && 
        b.status !== 'completed' && 
        b.status !== 'cancelled'
      );
    } else if (filter === 'past') {
      return bookings.filter(b => 
        new Date(b.date) < now || 
        b.status === 'completed' || 
        b.status === 'cancelled'
      );
    }
    return bookings;
  };

  const filteredBookings = filterBookings();

  if (authLoading || loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'}`}>
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mb-8">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95">
            Manage your culinary experiences and upcoming chef bookings
          </p>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-white/15 rounded-full animate-bounce"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Filter Bar */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h2 className={`text-3xl font-bold ${isDark ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'}`}>
              {bookings.length} Total Booking{bookings.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className={`rounded-xl p-2 shadow-sm border mb-6 inline-flex gap-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            {['all', 'upcoming', 'past'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-2.5 font-medium capitalize transition-all duration-200 rounded-lg relative ${
                  filter === tab
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                    : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
                }`}
              >
                {tab}
                {tab === 'upcoming' && bookings.filter(b => new Date(b.date) >= new Date() && b.status !== 'completed' && b.status !== 'cancelled').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {bookings.filter(b => new Date(b.date) >= new Date() && b.status !== 'completed' && b.status !== 'cancelled').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <svg className={`w-24 h-24 mx-auto mb-6 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
            <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No {filter === 'all' ? '' : filter} bookings
            </h3>
            <p className={`mb-8 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {filter === 'upcoming' && "You don't have any upcoming bookings."}
              {filter === 'past' && "You don't have any past bookings yet."}
              {filter === 'all' && "Start exploring chefs and book your first culinary experience!"}
            </p>
            <Link to="/book-chef" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Chefs
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className={`group rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'}`}>
                <div className="p-6">
                  {/* Chef Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative flex-shrink-0">
                        <img
                          src={booking.chef?.profilePicture || booking.chef?.profileImage?.url || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=60'}
                          alt={booking.chef?.name}
                          className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-100 dark:ring-orange-900/30 group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            if (!e.target.dataset.errorHandled) {
                              e.target.dataset.errorHandled = 'true';
                              e.target.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=60';
                            }
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {booking.chef?.name || 'Chef'}
                        </h3>
                        <p className={`text-sm font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                          {booking.serviceType || 'Booking'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div>
                      {booking.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                          Pending
                        </span>
                      )}
                      {booking.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                          Confirmed
                        </span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          Completed
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                          </svg>
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3 mb-4">
                    <div className={`flex items-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <svg className="w-5 h-5 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className={`flex items-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <svg className="w-5 h-5 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{booking.time || 'Time not specified'}</span>
                    </div>
                    {booking.guestCount && (
                      <div className={`flex items-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <svg className="w-5 h-5 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">{booking.guestCount} Guest{booking.guestCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {booking.location && (
                      <div className={`flex items-start text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <svg className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{booking.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    {booking.totalPrice && (
                      <div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Amount</p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>₹{booking.totalPrice.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
