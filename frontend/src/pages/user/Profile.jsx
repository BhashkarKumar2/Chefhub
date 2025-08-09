import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from backend
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('userId') || '688f1698011794190d7203f6'; // Test user ID
        console.log('🔍 Loading user profile for ID:', userId);
        
        const response = await fetch(`https://chefhub.onrender.com/api/user/profile/${userId}`);
        if (response.ok) {
          const user = await response.json();
          console.log('✅ User data loaded:', user);
          setUserData(user);
        } else {
          console.error('❌ Failed to load user data');
          // Fallback to default data with consistent naming, checking localStorage first
          const storedUserName = localStorage.getItem('userName');
          const storedUserEmail = localStorage.getItem('userEmail');
          setUserData({
            name: storedUserName || 'User',
            email: storedUserEmail || 'user@example.com',
            phone: '+91-9876543210',
            profileImage: 'https://i.pravatar.cc/150?img=3',
            joinDate: 'January 2024',
            location: 'Mumbai, India',
            bio: 'Food enthusiast who loves exploring new cuisines and hosting dinner parties.',
            preferences: ['Italian', 'Mexican', 'Asian', 'Mediterranean']
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to default data with consistent naming, checking localStorage first
        const storedUserName = localStorage.getItem('userName');
        const storedUserEmail = localStorage.getItem('userEmail');
        setUserData({
          name: storedUserName || 'User',
          email: storedUserEmail || 'user@example.com',
          phone: '+91-9876543210',
          profileImage: 'https://i.pravatar.cc/150?img=3',
          joinDate: 'January 2024', 
          location: 'Mumbai, India',
          bio: 'Food enthusiast who loves exploring new cuisines and hosting dinner parties.',
          preferences: ['Italian', 'Mexican', 'Asian', 'Mediterranean']
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const user = userData || {
    name: 'Loading...',
    email: 'Loading...',
    phone: 'Loading...',
    profileImage: 'https://i.pravatar.cc/150?img=3',
    joinDate: 'Loading...',
    location: 'Loading...',
    bio: 'Loading...',
    preferences: [],
    cuisinePreferences: []
  };

  const stats = [
    { label: 'Total Bookings', value: '12', icon: '📅' },
    { label: 'Favorite Chefs', value: '8', icon: '❤️' },
    { label: 'Reviews Given', value: '9', icon: '⭐' },
    { label: 'Member Since', value: '2024', icon: '🏆' }
  ];

  const recentBookings = [
    { chef: 'Chef Mario Rossi', date: 'Jan 15, 2024', status: 'Completed', rating: 5 },
    { chef: 'Chef Sarah Kim', date: 'Jan 10, 2024', status: 'Completed', rating: 4 },
    { chef: 'Chef Alex Chen', date: 'Dec 28, 2023', status: 'Completed', rating: 5 }
  ];

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '👤' },
    { id: 'bookings', name: 'Bookings', icon: '📅' },
    { id: 'favorites', name: 'Favorites', icon: '❤️' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-5 left-10 w-16 h-16 bg-white/15 rounded-full animate-bounce"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img
                src={user.profileImage || 'https://i.pravatar.cc/150?img=3'}
                alt="Profile"
                className="w-32 h-32 rounded-full shadow-xl border-4 border-white/30 backdrop-blur-sm object-cover"
                onError={(e) => {
                  e.target.src = 'https://i.pravatar.cc/150?img=3';
                }}
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-extrabold mb-2">{user.name}</h1>
              <p className="text-xl opacity-95 mb-2">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm opacity-90">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                  </svg>
                  {user.city ? `${user.city}${user.state ? `, ${user.state}` : ''}${user.country ? `, ${user.country}` : ''}` : (user.location || 'Location not set')}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                  Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : (user.joinDate || '2024')}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                  </svg>
                  {user.phone}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/edit-profile"
                className="px-6 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-white/30"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500/80 text-white rounded-xl hover:bg-red-600 transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-purple-600 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Bio Section */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">About Me</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{user.bio}</p>
                </div>

                {/* Preferences */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Cuisine Preferences</h3>
                  <div className="flex flex-wrap gap-3">
                    {(user.preferences || user.cuisinePreferences || []).map((pref, index) => (
                      <span key={index} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full font-semibold border border-purple-200">
                        {pref}
                      </span>
                    ))}
                    {(!user.preferences && !user.cuisinePreferences) || (user.preferences || user.cuisinePreferences || []).length === 0 ? (
                      <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-full font-semibold border border-gray-200">
                        No preferences set
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Bookings</h3>
                  <div className="space-y-4">
                    {recentBookings.map((booking, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-6 flex items-center justify-between hover:shadow-md transition-shadow duration-300">
                        <div>
                          <h4 className="font-semibold text-gray-800">{booking.chef}</h4>
                          <p className="text-gray-600 text-sm">{booking.date}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            {booking.status}
                          </span>
                          <div className="flex items-center">
                            {[...Array(booking.rating)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">All Bookings</h3>
                <p className="text-gray-500 mb-6">View and manage all your bookings here</p>
                <Link to="/bookings" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold">
                  View All Bookings
                </Link>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                </svg>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Favorite Chefs</h3>
                <p className="text-gray-500 mb-6">Your saved chefs will appear here</p>
                <Link to="/favorites" className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold">
                  View Favorites
                </Link>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
                </svg>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Account Settings</h3>
                <p className="text-gray-500 mb-6">Manage your account preferences and settings</p>
                <Link to="/edit-profile" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold">
                  Edit Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
