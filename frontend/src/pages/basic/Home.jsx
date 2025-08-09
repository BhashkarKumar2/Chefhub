import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BackgroundCarousel from '../../components/BackgroundCarousel';
import TestimonialCarousel from '../../components/TestimonialCarouselNew';

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`
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
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-950">
      {/* Hero Section with Chef-Themed Background and Glassmorphism */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80"
          alt="Chef cooking background"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ filter: 'brightness(0.7) blur(2px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/60 to-black/80 z-0" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-8 flex flex-col items-center justify-center">
          <div className="backdrop-blur-xl bg-white/20 border border-blue-200/40 rounded-3xl shadow-2xl p-12 mt-20 mb-12 flex flex-col items-center w-full">
            <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="ChefHub Logo" className="w-20 h-20 mb-6 drop-shadow" />
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg">
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">Book World-Class Chefs</span>
              <span className="block mt-2">for <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Unforgettable</span> Experiences</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-10 text-white/90 max-w-3xl mx-auto">
              Transform your dining with top chefs who bring restaurant-quality cuisine to your home. Perfect for intimate dinners, celebrations, and special occasions.
            </p>
            
            {/* Location Search Feature */}
            <div className="w-full max-w-2xl mx-auto mb-8">
              <form onSubmit={handleLocationSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Enter your location to find nearby chefs..."
                    className="w-full px-6 py-4 rounded-xl text-gray-900 text-lg placeholder-gray-500 border-2 border-transparent focus:border-blue-400 focus:outline-none transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                          <animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                      </svg>
                      Find Chefs
                    </>
                  )}
                </button>
              </form>
              <p className="text-sm text-white/70 mt-2 text-center">
                🌍 Find professional chefs in your area • 📍 Enter your city, address, or ZIP code
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link to="/register" className="bg-gradient-to-r from-blue-700 to-blue-400 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-2">
                <span>Book Your Chef</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/services" className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300">
                Learn More
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <span className="block text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">500+</span>
                <span className="text-sm text-white/90 uppercase tracking-wide">Professional Chefs</span>
              </div>
              <div className="text-center">
                <span className="block text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">10k+</span>
                <span className="text-sm text-white/90 uppercase tracking-wide">Happy Customers</span>
              </div>
              <div className="text-center">
                <span className="block text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">50+</span>
                <span className="text-sm text-white/90 uppercase tracking-wide">Cuisines Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-black/80 via-blue-900/90 to-blue-950/90">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-700 mb-6">Why Choose ChefHub?</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              We connect you with exceptional culinary talent for unforgettable dining experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Verified Professionals</h3>
              <p className="text-white/80 leading-relaxed">
                All our chefs are thoroughly vetted, certified professionals with extensive culinary experience and stellar reviews.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">In-Home Service</h3>
              <p className="text-white/80 leading-relaxed">
                Enjoy restaurant-quality meals in the comfort of your own home. Our chefs bring everything needed for your perfect meal.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Personalized Menus</h3>
              <p className="text-white/80 leading-relaxed">
                Custom menus tailored to your preferences, dietary restrictions, and special occasions. Every meal is uniquely yours.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Flexible Scheduling</h3>
              <p className="text-white/80 leading-relaxed">
                Book chefs for lunch, dinner, or special events. Same-day bookings available with 24/7 customer support.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Satisfaction Guaranteed</h3>
              <p className="text-white/80 leading-relaxed">
                100% satisfaction guarantee with transparent pricing and no hidden fees. Your perfect meal is our commitment.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Safe & Secure</h3>
              <p className="text-white/80 leading-relaxed">
                All payments are secure, chefs are insured, and we follow strict health and safety protocols for your peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-blue-500 bg-clip-text text-transparent">🤖 AI-Powered Chef Experience</span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Experience the future of culinary booking with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center hover:bg-white/20 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Smart Chef Matching</h3>
              <p className="text-white/80 leading-relaxed">
                AI analyzes your preferences to recommend the perfect chef for your taste, budget, and occasion.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center hover:bg-white/20 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Custom Menu Generation</h3>
              <p className="text-white/80 leading-relaxed">
                Generate personalized menus tailored to your event, dietary restrictions, and culinary preferences.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center hover:bg-white/20 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI Culinary Assistant</h3>
              <p className="text-white/80 leading-relaxed">
                Get instant answers about recipes, ingredients, and cooking tips from our intelligent assistant.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/book-chef-ai" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
              >
                <span>🤖 Try AI Booking</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link 
                to="/ai-features" 
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                ✨ Explore AI Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-black/90 via-blue-900/90 to-blue-950/90">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">How It Works</h2>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
              Getting your perfect chef is simple and straightforward
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">1</div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-3">Browse & Choose</h3>
                  <p className="text-white/80 leading-relaxed">
                    Browse our curated selection of professional chefs and their specialties. Read reviews and view portfolios.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">2</div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-3">Customize Your Menu</h3>
                  <p className="text-white/80 leading-relaxed">
                    Work with your chosen chef to create a personalized menu that fits your preferences and dietary needs.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">3</div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-3">Enjoy Your Experience</h3>
                  <p className="text-white/80 leading-relaxed">
                    Relax while your chef prepares an extraordinary meal in your kitchen. Enjoy restaurant-quality dining at home.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-14 bg-gradient-to-b from-black/80 via-blue-900/90 to-blue-950/90">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 ">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">What Our Clients Say</h2>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
              Real experiences from satisfied customers who've transformed their dining
            </p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-700 to-blue-400">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Ready for an Extraordinary Culinary Experience?</h2>
            <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto opacity-95">
              Join thousands of satisfied customers who've discovered the joy of professional in-home dining.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register" className="bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                Book Your Chef Today
              </Link>
              <Link to="/contact" className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
