import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeAwareStyle } from '../../utils/themeUtils';
import BackgroundCarousel from '../../components/BackgroundCarousel';
import TestimonialCarousel from '../../components/TestimonialCarousel';
import logo from '../../assets/logo.png'
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;


// Animated counter hook
function useCountUp(target, duration = 1200) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    let end = typeof target === 'number' ? target : parseInt(target);
    let startTime = null;
    function animate(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(end);
    }
    requestAnimationFrame(animate);
    return () => setCount(end);
  }, [target, duration]);
  return count;
}

const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/geo                    <>🤖 {isAuthenticated ? 'Experience AI Features' : 'Sign Up for AI Features'}</>ode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const coordinates = data.features[0].geometry.coordinates;
      return {
        latitude: coordinates[1],
        longitude: coordinates[0],
        address: data.features[0].properties.label
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const Home = () => {
  const { theme, classes, isDark, getClass } = useThemeAwareStyle();
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Function to handle booking button clicks
  const handleBookingClick = (e) => {
    e.preventDefault();
    
    // Don't proceed if auth status is still loading
    if (isLoading) {
      console.log('Auth status still loading, please wait...');
      return;
    }

    // Additional checks for authentication
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    console.log('Auth status:', { 
      isAuthenticated, 
      user, 
      isLoading, 
      hasToken: !!token,
      hasUserId: !!userId 
    });
    
    // More strict authentication check
    if (isAuthenticated && user && user.id && token) {
      console.log('User is fully authenticated, navigating to book-chef');
      navigate('/book-chef');
    } else {
      console.log('User not authenticated, redirecting to register page');
      navigate('/register', { state: { redirectTo: '/book-chef' } });
    }
  };

  // Function to handle AI Features button clicks
  const handleAIFeaturesClick = (e) => {
    e.preventDefault();
    
    // Don't proceed if auth status is still loading
    if (isLoading) {
      console.log('Auth status still loading, please wait...');
      return;
    }

    // Additional checks for authentication
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    console.log('AI Features - Auth status:', { 
      isAuthenticated, 
      user, 
      isLoading, 
      hasToken: !!token,
      hasUserId: !!userId 
    });
    
    // More strict authentication check
    if (isAuthenticated && user && user.id && token) {
      console.log('User is fully authenticated, navigating to AI features');
      navigate('/ai-features');
    } else {
      console.log('User not authenticated, redirecting to register page');
      navigate('/register', { state: { redirectTo: '/ai-features' } });
    }
  };

  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!searchLocation.trim()) {
      alert('Please enter a location');
      return;
    }

    setIsSearching(true);
    try {
      const locationData = await geocodeAddress(searchLocation);
      if (locationData) {
        // Navigate to BookChef page with location data
        navigate('/book-chef', { 
          state: { 
            searchLocation: locationData.address,
            coordinates: {
              lat: locationData.latitude,
              lon: locationData.longitude
            }
          }
        });
      } else {
        alert('Location not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for location. Please try again.');
    }
    setIsSearching(false);
  };

  return (
    <div className={`relative overflow-hidden ${getClass('bgSecondary')}`}>
      {/* Dynamic Background - Updated to be theme-aware */}
      <div className="fixed inset-0 z-0">
        <div className={`absolute inset-0 ${getClass('bgPrimary')}`}></div>
        <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,183,77,0.15),rgba(255,255,255,0))]' : 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,183,77,0.3),rgba(255,255,255,0))]'}`}></div>
        {/* Floating Elements - Made subtler in dark mode */}
        <div className={`absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r ${isDark ? 'from-orange-200/15 to-amber-300/15' : 'from-orange-200/30 to-amber-300/30'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse`}></div>
        <div className={`absolute top-3/4 right-1/4 w-72 h-72 bg-gradient-to-r ${isDark ? 'from-yellow-200/15 to-orange-400/15' : 'from-yellow-200/30 to-orange-400/30'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse`} style={{animationDelay: '2s'}}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r ${isDark ? 'from-amber-200/15 to-yellow-300/15' : 'from-amber-200/30 to-yellow-300/30'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse`} style={{animationDelay: '4s'}}></div>
        <div className={`absolute top-1/2 right-1/3 w-96 h-96 bg-gradient-to-r ${isDark ? 'from-orange-100/15 to-amber-200/15' : 'from-orange-100/25 to-amber-200/25'} rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse`} style={{animationDelay: '1s'}}></div>
        <div className={`absolute bottom-1/3 left-1/2 w-80 h-80 bg-gradient-to-r ${isDark ? 'from-yellow-100/15 to-orange-200/15' : 'from-yellow-100/25 to-orange-200/25'} rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse`} style={{animationDelay: '3s'}}></div>
      </div>

      {/* Hero Section - Updated with theme support */}
      <section className="relative min-h-screen flex items-center justify-center z-10">
        <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Main Hero Content */}
          <div className={`text-center mb-12 ${getClass('textSecondary')}`}>
            {/* Animated Logo */}
            <div className="mb-8 flex justify-center">
              <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                <img 
                  src={logo} 
                  alt="ChefHub Logo" 
                  className="w-20 h-30 object-contain relative z-10"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback if logo doesn't load - already theme-aware */}
                <div className={`w-20 h-20 flex items-center justify-center rounded-full text-2xl font-bold relative z-10 ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-yellow-300' : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600'}`} style={{display: 'none'}}>
                  CH
                </div>
                
              </div>
            </div>

            {/* Main Heading - Updated with theme support */}
            <div className={`transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-none mb-6">
                <span className={`block bg-gradient-to-r ${isDark ? 'from-orange-500 via-amber-400 to-yellow-400' : 'from-orange-800 via-amber-700 to-yellow-700'} bg-clip-text text-transparent drop-shadow-2xl`}>
                  Book World-Class
                </span>
                <span className="block bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent mt-2">
                  Chefs
                </span>
                <span className={`block ${isDark ? 'text-gray-300' : 'text-gray-700'} text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal mt-4 leading-relaxed`}>
                  for Unforgettable Culinary Experiences
                </span>
              </h1>
            </div>

            {/* Subtitle - Updated with theme support */}
            <div className={`transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p className={`text-lg sm:text-xl md:text-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-4xl mx-auto leading-relaxed mb-12`}>
                Transform your dining experience with <span className="text-orange-600 font-semibold">professional chefs</span> who bring 
                <span className="text-amber-600 font-semibold"> restaurant-quality cuisine</span> directly to your home
              </p>
            </div>
            
            {/* Action Buttons - Already using good theme-aware gradients */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 delay-1100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <button 
                onClick={handleBookingClick}
                disabled={isLoading}
                className="group relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white px-10 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 min-w-[200px] justify-center overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                  )}
                  {isLoading ? 'Loading...' : (isAuthenticated ? 'Book Your Chef' : 'Sign Up to Book Chef')}
                </span>
              </button>
              
              <button 
                onClick={handleAIFeaturesClick}
                disabled={isLoading}
                className="group relative bg-white/20 backdrop-blur-md border-2 border-orange-300/50 text-orange-700 px-10 py-4 rounded-2xl text-lg font-bold hover:bg-orange-100 hover:text-orange-800 transition-all duration-300 hover:scale-105 flex items-center gap-3 min-w-[200px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>🤖</>
                  )}
                  {isLoading ? 'Loading...' : (isAuthenticated ? 'AI Features' : 'Sign Up for AI Features')}
                </span>
              </button>
            </div>
            {/* Stats Section - Updated with theme support */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-1300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="group text-center">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur ${isDark ? 'opacity-30' : 'opacity-20'} group-hover:opacity-${isDark ? '50' : '40'} transition-opacity duration-300`}></div>
                  <div className={`relative ${isDark ? 'bg-gray-800/70' : 'bg-white/20'} backdrop-blur-md border ${isDark ? 'border-orange-500/50' : 'border-orange-200/30'} rounded-2xl p-6 ${isDark ? 'hover:bg-gray-700/80' : 'hover:bg-white/30'} transition-all duration-300`}>
                    <div className={`text-4xl sm:text-5xl font-black ${isDark ? 'text-orange-400' : 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'} mb-2`}>
                      {useCountUp(500, 1200)}+
                    </div>
                    <div className={`${isDark ? 'text-orange-300' : 'text-orange-800'} text-sm uppercase tracking-wider font-semibold`}>
                      Professional Chefs
                    </div>
                  </div>
                </div>
              </div>
              <div className="group text-center">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur ${isDark ? 'opacity-30' : 'opacity-20'} group-hover:opacity-${isDark ? '50' : '40'} transition-opacity duration-300`}></div>
                  <div className={`relative ${isDark ? 'bg-gray-800/70' : 'bg-white/20'} backdrop-blur-md border ${isDark ? 'border-orange-500/50' : 'border-orange-200/30'} rounded-2xl p-6 ${isDark ? 'hover:bg-gray-700/80' : 'hover:bg-white/30'} transition-all duration-300`}>
                    <div className={`text-4xl sm:text-5xl font-black ${isDark ? 'text-orange-400' : 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'} mb-2`}>
                      {useCountUp(10000, 1200)}k+
                    </div>
                    <div className={`${isDark ? 'text-orange-300' : 'text-orange-800'} text-sm uppercase tracking-wider font-semibold`}>
                      Happy Customers
                    </div>
                  </div>
                </div>
              </div>
              <div className="group text-center">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur ${isDark ? 'opacity-30' : 'opacity-20'} group-hover:opacity-${isDark ? '50' : '40'} transition-opacity duration-300`}></div>
                  <div className={`relative ${isDark ? 'bg-gray-800/70' : 'bg-white/20'} backdrop-blur-md border ${isDark ? 'border-orange-500/50' : 'border-orange-200/30'} rounded-2xl p-6 ${isDark ? 'hover:bg-gray-700/80' : 'hover:bg-white/30'} transition-all duration-300`}>
                    <div className={`text-4xl sm:text-5xl font-black ${isDark ? 'text-orange-400' : 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'} mb-2`}>
                      {useCountUp(50, 1200)}+
                    </div>
                    <div className={`${isDark ? 'text-orange-300' : 'text-orange-800'} text-sm uppercase tracking-wider font-semibold`}>
                      Cuisines Available
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900 via-orange-800 to-orange-950"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-orange-300 to-amber-500 bg-clip-text text-transparent">ChefHub</span>?
            </h2>
            <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              Experience the perfect blend of <span className="text-orange-300 font-semibold">culinary excellence</span> and 
              <span className="text-amber-200 font-semibold"> personalized service</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature Card 1 */}
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-700 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
                <h3 className={`text-2xl font-bold text-white mb-4 text-center ${isDark ? 'text-yellow-200' : ''}`}>Verified Professionals</h3>
                <p className={`leading-relaxed text-center flex-grow ${isDark ? 'text-yellow-100' : 'text-white/70'}`}>
                  All our chefs are thoroughly vetted, certified professionals with extensive culinary experience and stellar reviews.
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-800 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-amber-700 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                  </div>
                </div>
                <h3 className={`text-2xl font-bold text-white mb-4 text-center ${isDark ? 'text-yellow-200' : ''}`}>In-Home Service</h3>
                <p className={`leading-relaxed text-center flex-grow ${isDark ? 'text-yellow-100' : 'text-white/70'}`}>
                  Enjoy restaurant-quality meals in the comfort of your own home. Our chefs bring everything needed for your perfect meal.
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-800 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-amber-700 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  </div>
                </div>
                <h3 className={`text-2xl font-bold text-white mb-4 text-center ${isDark ? 'text-yellow-200' : ''}`}>Personalized Menus</h3>
                <p className={`leading-relaxed text-center flex-grow ${isDark ? 'text-yellow-100' : 'text-white/70'}`}>
                  Custom menus tailored to your preferences, dietary restrictions, and special occasions. Every meal is uniquely yours.
                </p>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-800 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-amber-700 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                </div>
                <h3 className={`text-2xl font-bold text-white mb-4 text-center ${isDark ? 'text-yellow-200' : ''}`}>Flexible Scheduling</h3>
                <p className={`leading-relaxed text-center flex-grow ${isDark ? 'text-yellow-100' : 'text-white/70'}`}>
                  Book chefs for lunch, dinner, or special events. Same-day bookings available with 24/7 customer support.
                </p>
              </div>
            </div>

            {/* Feature Card 5 */}
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-800 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-amber-700 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                </div>
                <h3 className={`text-2xl font-bold text-white mb-4 text-center ${isDark ? 'text-yellow-200' : ''}`}>Satisfaction Guaranteed</h3>
                <p className={`leading-relaxed text-center flex-grow ${isDark ? 'text-yellow-100' : 'text-white/70'}`}>
                  100% satisfaction guarantee with transparent pricing and no hidden fees. Your perfect meal is our commitment.
                </p>
              </div>
            </div>

            {/* Feature Card 6 */}
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-800 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-amber-700 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                </div>
                <h3 className={`text-2xl font-bold text-white mb-4 text-center ${isDark ? 'text-yellow-200' : ''}`}>Safe & Secure</h3>
                <p className={`leading-relaxed text-center flex-grow ${isDark ? 'text-yellow-100' : 'text-white/70'}`}>
                  All payments are secure, chefs are insured, and we follow strict health and safety protocols for your peace of mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
  <section className="py-24 bg-gradient-to-br from-orange-900 via-orange-700 to-amber-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400 bg-clip-text text-transparent">🤖 AI-Powered Chef Experience</span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Experience the future of culinary booking with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center hover:bg-white/20 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Smart Chef Matching</h3>
              <p className="text-white/80 leading-relaxed">
                AI analyzes your preferences to recommend the perfect chef for your taste, budget, and occasion.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center hover:bg-white/20 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-amber-700 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Custom Menu Generation</h3>
              <p className="text-white/80 leading-relaxed">
                Generate personalized menus tailored to your event, dietary restrictions, and culinary preferences.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center hover:bg-white/20 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-600 to-amber-800 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI Culinary Assistant</h3>
              <p className="text-white/80 leading-relaxed">
                Get instant answers about recipes, ingredients, and cooking tips from our intelligent assistant.
              </p>
            </div>
          </div>

          
        </div>
      </section>

      {/* How It Works Section - Updated for theme support */}
      <section className={`relative py-32 ${isDark ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100'}`}>
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-orange-800/10 to-amber-700/20' : 'bg-gradient-to-br from-orange-500/10 to-amber-600/20'}`}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black ${isDark ? 'text-orange-300' : 'text-orange-900'} mb-8`}>
              How It <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className={`text-xl md:text-2xl ${isDark ? 'text-orange-300' : 'text-orange-700'} max-w-4xl mx-auto leading-relaxed font-medium`}>
              Getting your perfect chef is <span className={isDark ? 'text-orange-400 font-bold' : 'text-orange-800 font-bold'}>simple and straightforward</span>
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Step 1 - Updated with theme support */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className={`absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                  <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} border-4 ${isDark ? 'border-orange-800/30' : 'border-orange-200'} rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105`}>
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
                      1
                    </div>
                    <h3 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-orange-300' : 'text-orange-900'} mb-4`}>Browse & Choose</h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-orange-700'} leading-relaxed text-lg`}>
                      Browse our curated selection of professional chefs and their specialties. Read reviews and view portfolios to find your perfect match.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 - Updated with theme support */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className={`absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                  <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} border-4 ${isDark ? 'border-orange-800/30' : 'border-orange-200'} rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105`}>
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
                      2
                    </div>
                    <h3 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-orange-300' : 'text-orange-900'} mb-4`}>Customize Your Menu</h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-orange-700'} leading-relaxed text-lg`}>
                      Work with your chosen chef to create a personalized menu that fits your preferences, dietary needs, and special occasion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 - Updated with theme support */}
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                  <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} border-4 ${isDark ? 'border-orange-800/30' : 'border-orange-200'} rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105`}>
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
                      3
                    </div>
                    <h3 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-orange-300' : 'text-orange-900'} mb-4`}>Enjoy Your Experience</h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-orange-700'} leading-relaxed text-lg`}>
                      Relax while your chef prepares an extraordinary meal in your kitchen. Enjoy restaurant-quality dining at home.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action - Updated with theme support */}
            <div className="text-center mt-16">
              <div className={`${isDark ? 'bg-gray-800/90 backdrop-blur-md border-2 border-orange-800/30' : 'bg-white/90 backdrop-blur-md border-2 border-orange-200'} rounded-2xl p-8 shadow-xl`}>
                <h3 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-orange-300' : 'text-orange-900'} mb-4`}>
                  Ready to Get Started?
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-orange-700'} mb-8 text-lg`}>
                  Join thousands of satisfied customers and book your perfect chef today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={handleBookingClick}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Loading...' : (isAuthenticated ? 'Start Booking Now' : 'Sign Up to Start Booking')}
                  </button>
                  <Link 
                    to="/chefs" 
                    className={`border-2 ${isDark ? 'border-orange-400 text-orange-400 hover:bg-orange-400' : 'border-orange-600 text-orange-600 hover:bg-orange-600'} px-10 py-4 rounded-xl text-lg font-bold hover:text-white transition-all duration-300`}
                  >
                    Browse Chefs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Updated with theme support */}
      <section className={`py-20 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-orange-250 via-amber-400 to-orange-600'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-extrabold ${isDark ? 'text-orange-300' : 'text-orange-900'} mb-6 tracking-tight drop-shadow-lg`}>
              What Our Clients Say
            </h2>
            <p className={`text-xl md:text-2xl ${isDark ? 'text-orange-400/80' : 'text-orange-700/80'} max-w-3xl mx-auto font-medium`}>
              Real stories from satisfied customers who discovered the joy of professional in-home dining.
            </p>
          </div>
           
          <TestimonialCarousel />
        </div>
      </section>

    
    </div>
  );
};

export default Home;
