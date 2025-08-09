import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentActivity: [],
    upcomingBookings: [],
    stats: {
      totalBookings: 0,
      favoriteChefs: 0,
      totalSpent: 0,
      reviewsGiven: 0
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load user data and dashboard data from backend
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          console.log('🔍 No authentication found, using guest mode...');
          setUserData({
            name: 'Guest User',
            email: null
          });
          setLoading(false);
          return;
        }

        console.log('🔍 Loading dashboard data...');
        
        // Load user profile
        const userResponse = await fetch(`https://chefhub.onrender.com/api/user/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (userResponse.ok) {
          const user = await userResponse.json();
          console.log('✅ User data loaded for dashboard:', user);
          setUserData(user);
        } else {
          console.error('❌ Failed to load user data');
          const storedUserName = localStorage.getItem('userName');
          setUserData({
            name: storedUserName || 'User',
            email: null
          });
        }

        // Load dashboard statistics and recent data
        await Promise.all([
          loadBookingsData(token),
          loadRecentActivity(token),
          loadStats(token)
        ]);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        const storedUserName = localStorage.getItem('userName');
        setUserData({
          name: storedUserName || 'User',
          email: null
        });
      } finally {
        setLoading(false);
      }
    };

    const loadBookingsData = async (token) => {
      try {
        const response = await fetch('https://chefhub.onrender.com/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const bookings = data.bookings || [];
          
          // Filter upcoming bookings (confirmed or pending, and future dates)
          const upcoming = bookings
            .filter(booking => {
              const bookingDate = new Date(booking.date);
              const now = new Date();
              return bookingDate > now && ['confirmed', 'pending'].includes(booking.status?.toLowerCase());
            })
            .slice(0, 3) // Show only first 3
            .map(booking => ({
              chef: booking.chef?.fullName || booking.chef?.name || 'Unknown Chef',
              date: formatBookingDate(booking.date, booking.time),
              event: booking.serviceType || 'Chef Service',
              status: booking.status || 'Pending'
            }));
          
          setDashboardData(prev => ({
            ...prev,
            upcomingBookings: upcoming
          }));
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
      }
    };

    const loadRecentActivity = async (token) => {
      try {
        // This would ideally come from an activity log API endpoint
        // For now, we'll derive it from recent bookings
        const response = await fetch('https://chefhub.onrender.com/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const bookings = data.bookings || [];
          
          // Generate recent activity from bookings
          const recentActivity = bookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4)
            .map(booking => {
              const timeAgo = getTimeAgo(booking.createdAt);
              const chefName = booking.chef?.fullName || booking.chef?.name || 'Unknown Chef';
              
              return {
                action: `Booked ${chefName}`,
                time: timeAgo,
                type: 'booking'
              };
            });
          
          setDashboardData(prev => ({
            ...prev,
            recentActivity
          }));
        }
      } catch (error) {
        console.error('Error loading recent activity:', error);
      }
    };

    const loadStats = async (token) => {
      try {
        const response = await fetch('https://chefhub.onrender.com/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const bookings = data.bookings || [];
          
          // Calculate stats from bookings
          const totalBookings = bookings.length;
          const totalSpent = bookings
            .filter(b => ['confirmed', 'completed'].includes(b.status?.toLowerCase()))
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
          
          const reviewsGiven = bookings.filter(b => b.status?.toLowerCase() === 'completed').length;
          
          // Note: favoriteChefs would need a separate API call to favorites endpoint
          const favoriteChefs = 0; // Placeholder until favorites API is implemented
          
          setDashboardData(prev => ({
            ...prev,
            stats: {
              totalBookings,
              favoriteChefs,
              totalSpent,
              reviewsGiven
            }
          }));
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadDashboardData();
  }, []);

  // Helper functions
  const formatBookingDate = (date, time) => {
    if (!date) return 'Date TBD';
    const bookingDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (bookingDate.toDateString() === today.toDateString()) {
      return `Today ${time || ''}`;
    } else if (bookingDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${time || ''}`;
    } else {
      return `${bookingDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} ${time || ''}`;
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  const userName = userData?.name || 'User';

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    {
      title: "🤖 AI Book Chef",
      description: "Get AI-powered chef recommendations and custom menus",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      link: "/book-chef-ai",
      gradient: "from-cyan-600 to-blue-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200"
    },
    {
      title: "Book a Chef",
      description: "Find and book professional chefs for your next event",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6V5a2 2 0 114 0v1H8zm2 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd"></path>
        </svg>
      ),
      link: "/book-chef",
      gradient: "from-purple-600 to-blue-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "✨ AI Features",
      description: "Explore AI-powered recommendations and menu generation",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      ),
      link: "/ai-features",
      gradient: "from-amber-600 to-orange-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    },
    {
      title: "Become a Chef",
      description: "Join our platform as a professional chef",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
        </svg>
      ),
      link: "/chef-onboarding",
      gradient: "from-green-600 to-teal-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "My Favorites",
      description: "View and manage your saved chefs",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
        </svg>
      ),
      link: "/favorites",
      gradient: "from-pink-600 to-rose-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200"
    },
    {
      title: "My Profile",
      description: "Manage your account and preferences",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
        </svg>
      ),
      link: "/profile",
      gradient: "from-indigo-600 to-purple-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-5 left-10 w-16 h-16 bg-white/15 rounded-full animate-bounce"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className="text-xl opacity-95 mb-4">
              Ready to create amazing culinary experiences?
            </p>
            <div className="flex items-center text-lg opacity-90">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
              </svg>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`group ${action.bgColor} ${action.borderColor} border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-opacity-80`}
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {action.description}
                </p>
                <div className="mt-4 flex items-center text-purple-600 text-sm font-semibold group-hover:text-purple-700">
                  Explore
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Upcoming Bookings */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Upcoming Bookings</h3>
                <Link to="/bookings" className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center">
                  View All
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </Link>
              </div>
              
              {dashboardData.upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcomingBookings.map((booking, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-800 mb-1">{booking.chef}</h4>
                          <p className="text-gray-600 mb-2">{booking.event}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                            </svg>
                            {booking.date}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          booking.status?.toLowerCase() === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                  <p className="text-gray-500 mb-4">No upcoming bookings</p>
                  <Link to="/book-chef" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold">
                    Book Your First Chef
                  </Link>
                </div>
              )}
            </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h3>
            {dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === 'booking' ? 'bg-purple-500' :
                      activity.type === 'favorite' ? 'bg-pink-500' :
                      activity.type === 'completed' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-500 text-sm">No recent activity</p>
                <p className="text-gray-400 text-xs mt-1">Your activity will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          {[
            { 
              label: "Total Bookings", 
              value: dashboardData.stats.totalBookings.toString(), 
              icon: "📅", 
              color: "text-purple-600" 
            },
            { 
              label: "Favorite Chefs", 
              value: dashboardData.stats.favoriteChefs.toString(), 
              icon: "❤️", 
              color: "text-pink-600" 
            },
            { 
              label: "Total Spent", 
              value: `₹${dashboardData.stats.totalSpent.toLocaleString()}`, 
              icon: "💰", 
              color: "text-green-600" 
            },
            { 
              label: "Reviews Given", 
              value: dashboardData.stats.reviewsGiven.toString(), 
              icon: "⭐", 
              color: "text-yellow-600" 
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
