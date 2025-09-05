import React, { useState, useEffect } from 'react';
import { buildApiEndpoint } from '../../utils/apiConfig';
import { Link } from 'react-router-dom';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(buildApiEndpoint('bookings'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Bookings fetched:', data);
      
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setError(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiEndpoint(`bookings/${bookingId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh bookings list
        await fetchBookings();
        alert('Booking cancelled successfully');
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  // Handle booking status update
  const handleUpdateBooking = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiEndpoint(`bookings/${bookingId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh bookings list
        await fetchBookings();
        alert('Booking updated successfully');
      } else {
        alert(data.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  // Enhanced filter and sort bookings
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status?.toLowerCase() === filter);

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'amount') {
      return (b.totalPrice || 0) - (a.totalPrice || 0);
    } else if (sortBy === 'status') {
      const statusOrder = { 'pending': 0, 'confirmed': 1, 'completed': 2, 'cancelled': 3 };
      return (statusOrder[a.status?.toLowerCase()] || 0) - (statusOrder[b.status?.toLowerCase()] || 0);
    }
    return 0;
  });

  // Get action buttons based on booking status
  const getActionButtons = (booking) => {
    const status = booking.status?.toLowerCase();
    const actions = [];

    switch (status) {
      case 'pending':
        actions.push(
          <button 
            key="cancel"
            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300 text-sm font-medium"
            onClick={() => handleCancelBooking(booking._id)}
          >
            Cancel
          </button>
        );
        break;
      
      case 'confirmed':
        actions.push(
          <button 
            key="contact"
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 text-sm font-medium"
            onClick={() => {/* Add contact chef functionality */}}
          >
            Contact Chef
          </button>
        );
        actions.push(
          <button 
            key="cancel"
            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300 text-sm font-medium"
            onClick={() => handleCancelBooking(booking._id)}
          >
            Cancel
          </button>
        );
        break;
      
      case 'completed':
        actions.push(
          <button 
            key="rate"
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-all duration-300 text-sm font-medium"
            onClick={() => handleUpdateBooking(booking._id, 'rated')}
          >
            Rate Chef
          </button>
        );
        actions.push(
          <button 
            key="rebook"
            className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-300 text-sm font-medium"
            onClick={() => {/* Add rebook functionality */}}
          >
            Book Again
          </button>
        );
        break;
      
      case 'cancelled':
        actions.push(
          <button 
            key="rebook"
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all duration-300 text-sm font-medium"
            onClick={() => {/* Add rebook functionality */}}
          >
            Book Again
          </button>
        );
        break;
      
      default:
        break;
    }

    // Always add view details button
    actions.push(
      <button 
        key="details"
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm font-medium"
        onClick={() => {/* Add view details functionality */}}
      >
        View Details
      </button>
    );

    return actions;
  };

  // Status configuration with detailed information
  const statusInfo = {
    all: {
      label: 'All Bookings',
      description: 'View all your bookings regardless of status',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '📋'
    },
    pending: {
      label: 'Pending',
      description: 'Bookings awaiting confirmation',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '⏳'
    },
    confirmed: {
      label: 'Confirmed',
      description: 'Approved bookings ready for service',
      color: 'text-green-600',
      bgColor: 'bg-green-100 text-green-800 border-green-200',
      icon: '✅'
    },
    completed: {
      label: 'Completed',
      description: 'Successfully delivered services',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🎉'
    },
    cancelled: {
      label: 'Cancelled',
      description: 'Cancelled bookings and refunds',
      color: 'text-red-600',
      bgColor: 'bg-red-100 text-red-800 border-red-200',
      icon: '❌'
    }
  };

  const getStatusColor = (status) => {
    const statusKey = status?.toLowerCase();
    return statusInfo[statusKey]?.bgColor || statusInfo.all.bgColor;
  };

  const getStatusIcon = (status) => {
    const statusKey = status?.toLowerCase();
    return statusInfo[statusKey]?.icon || '?';
  };

  // Calculate status counts from actual bookings
  const statusCounts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
    pending: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
    completed: bookings.filter(b => b.status?.toLowerCase() === 'completed').length,
    cancelled: bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Bookings</h3>
          <p className="text-gray-600">Please wait while we fetch your booking history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchBookings}
            className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-6">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
            Your Bookings
          </h1>
          <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto">
            Manage and track all your chef booking experiences
          </p>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-8 h-8 bg-white/15 rounded-full animate-bounce"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-1">
        {/* Enhanced Stats Overview */}
      

        {/* Enhanced Filters and Sorting */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-5 mb-8 border border-purple-100">
          <div className="flex flex-col gap-6">
            {/* Status Filter with Visual Cards */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"></path>
                </svg>
                Filter by Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(statusInfo).map(([status, info]) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                      filter === status
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{info.icon}</span>
                      <span className={`font-semibold ${info.color}`}>
                        {info.label}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs ml-auto">
                        {statusCounts[status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Quick Filter:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {Object.entries(statusInfo).map(([status, info]) => (
                    <option key={status} value={status}>
                      {info.icon} {info.label} ({statusCounts[status]})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="date">📅 Date (Newest First)</option>
                  <option value="amount">💰 Amount (Highest First)</option>
                  <option value="status">📊 Status</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Empty State */}
        {sortedBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-lg p-12 border border-purple-100">
              <div className="text-6xl mb-6">
                {filter === 'all' ? '📋' : statusInfo[filter]?.icon || '❓'}
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                {filter === 'all' ? 'No bookings found' : `No ${statusInfo[filter]?.label.toLowerCase()} bookings`}
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {filter === 'all' 
                  ? "You haven't made any bookings yet. Start exploring our amazing chefs and book your first culinary experience!"
                  : filter === 'pending'
                  ? "No pending bookings. All your bookings have been processed!"
                  : filter === 'confirmed'
                  ? "No confirmed bookings. Book a chef to see confirmed appointments here."
                  : filter === 'completed'
                  ? "No completed bookings yet. Your completed services will appear here."
                  : filter === 'cancelled'
                  ? "No cancelled bookings. Great job managing your appointments!"
                  : `No ${filter} bookings found. Try changing the filter.`
                }
              </p>
              
              {/* Action buttons based on filter */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {filter === 'all' && (
                  <Link 
                    to="/book-chef" 
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    Book Your First Chef
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                )}
                
                {filter !== 'all' && (
                  <>
                    <button
                      onClick={() => setFilter('all')}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                    >
                      View All Bookings
                    </button>
                    
                    <Link 
                      to="/book-chef" 
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium"
                    >
                      Book New Chef
                      <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Chef Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={booking.chef?.profileImage?.url || booking.chef?.photo || 'https://images.unsplash.com/photo-1594736797933-d0d6ee7ad6e1?w=400&auto=format&fit=crop&q=60'}
                        alt={booking.chef?.fullName || booking.chef?.name || 'Chef'}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {booking.chef?.fullName || booking.chef?.name || 'Unknown Chef'}
                        </h3>
                        <p className="text-purple-600 font-medium">
                          {booking.chef?.specialties?.[0] || booking.serviceType || 'Culinary Expert'}
                        </p>
                        <div className="flex items-center mt-1">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span className="text-sm text-gray-600">
                            {booking.chef?.rating || '4.5'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Date & Time</div>
                        <div className="font-semibold text-gray-800">{formatDate(booking.date)}</div>
                        <div className="text-sm text-gray-600">{formatTime(booking.time)}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Service & Guests</div>
                        <div className="font-semibold text-gray-800">{booking.serviceType || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{booking.guestCount || 0} guests</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Duration</div>
                        <div className="font-semibold text-gray-800">{booking.duration || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                        <div className="font-bold text-purple-600 text-lg">
                          ₹{(booking.totalPrice || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                        <span className="mr-2">{getStatusIcon(booking.status)}</span>
                        {booking.status || 'Pending'}
                      </span>
                      
                      <div className="flex gap-2 flex-wrap">
                        {getActionButtons(booking)}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Special Requests and Status Info */}
                  {booking.specialRequests && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                      <div className="text-sm text-gray-500 mb-1">Special Requests</div>
                      <div className="text-gray-700">{booking.specialRequests}</div>
                    </div>
                  )}

                  {/* Status Information Panel */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500">Current Status</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg">{getStatusIcon(booking.status)}</span>
                          <span className="font-semibold text-gray-800">
                            {statusInfo[booking.status?.toLowerCase()]?.label || booking.status || 'Unknown'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {statusInfo[booking.status?.toLowerCase()]?.description || 'Status information unavailable'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Booked on</div>
                        <div className="font-medium text-gray-700">{formatDate(booking.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {sortedBookings.length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white">
              <h3 className="text-3xl font-bold mb-4">Ready for Your Next Culinary Adventure?</h3>
              <p className="text-xl mb-8 opacity-95">Book another amazing chef and create more memorable experiences</p>
              <Link 
                to="/book-chef" 
                className="inline-flex items-center px-8 py-3 bg-white text-purple-600 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
              >
                Book Another Chef
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBookings;
