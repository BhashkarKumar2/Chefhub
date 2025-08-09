import React, { useState, useEffect } from 'react';
import { AIChefRecommendations, AIMenuGenerator, AIChatAssistant } from '../components/AIFeatures';

const EnhancedBookChef = () => {
  const [step, setStep] = useState(1);
  // OpenRouteService API key (store securely in production)
  const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
  const [userPreferences, setUserPreferences] = useState({
    serviceType: '',
    guestCount: '',
    budget: '',
    cuisinePreference: '',
    dietaryRestrictions: '',
    location: '',
    locationLat: '',
    locationLon: '',
    date: '',
    time: ''
  });
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [generatedMenu, setGeneratedMenu] = useState(null);
  const [showAIFeatures, setShowAIFeatures] = useState(false);

  // Geocode address to lat/lon using OpenRouteService
  const geocodeAddress = async (address) => {
    try {
      setLocationLoading(true);
      const res = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        return { lat: coords[1], lon: coords[0] };
      }
      return null;
    } catch (e) {
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePreferenceChange = (field, value) => {
    setUserPreferences(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'location') {
      setUserPreferences(prev => ({ ...prev, locationLat: '', locationLon: '' }));
      setLocationError('');
    }
  };

  const handleAIRecommendations = (recommendations) => {
    setAiRecommendations(recommendations);
    setShowAIFeatures(true);
  };

  const handleMenuGenerated = (menu) => {
    setGeneratedMenu(menu);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🤖 AI-Powered Chef Booking
          </h1>
          <p className="text-xl text-gray-600">
            Let our AI help you find the perfect chef and create amazing menus
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Your Chef</h2>
              
              {/* Step 1: Basic Preferences */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type
                      </label>
                      <select
                        value={userPreferences.serviceType}
                        onChange={(e) => handlePreferenceChange('serviceType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select event type</option>
                        <option value="birthday">Birthday Party</option>
                        <option value="marriage">Marriage Ceremony</option>
                        <option value="daily">Daily Cooking</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guest Count
                      </label>
                      <input
                        type="number"
                        value={userPreferences.guestCount}
                        onChange={(e) => handlePreferenceChange('guestCount', e.target.value)}
                        placeholder="Number of guests"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Range (₹)
                      </label>
                      <select
                        value={userPreferences.budget}
                        onChange={(e) => handlePreferenceChange('budget', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select budget range</option>
                        <option value="5000-10000">₹5,000 - ₹10,000</option>
                        <option value="10000-25000">₹10,000 - ₹25,000</option>
                        <option value="25000-50000">₹25,000 - ₹50,000</option>
                        <option value="50000+">₹50,000+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cuisine Preference
                      </label>
                      <select
                        value={userPreferences.cuisinePreference}
                        onChange={(e) => handlePreferenceChange('cuisinePreference', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Any cuisine</option>
                        <option value="north-indian">North Indian</option>
                        <option value="south-indian">South Indian</option>
                        <option value="continental">Continental</option>
                        <option value="chinese">Chinese</option>
                        <option value="italian">Italian</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Restrictions
                    </label>
                    <input
                      type="text"
                      value={userPreferences.dietaryRestrictions}
                      onChange={(e) => handlePreferenceChange('dietaryRestrictions', e.target.value)}
                      placeholder="e.g., vegetarian, vegan, gluten-free, nut allergy"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={userPreferences.date}
                        onChange={(e) => handlePreferenceChange('date', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Time
                      </label>
                      <input
                        type="time"
                        value={userPreferences.time}
                        onChange={(e) => handlePreferenceChange('time', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userPreferences.location}
                        onChange={(e) => handlePreferenceChange('location', e.target.value)}
                        placeholder="Event location/address"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow hover:scale-105 transition-all"
                        disabled={!userPreferences.location || locationLoading}
                        onClick={async () => {
                          if (!userPreferences.location) {
                            setLocationError('Please enter your address');
                            return;
                          }
                          setLocationError('');
                          const coords = await geocodeAddress(userPreferences.location);
                          if (coords) {
                            setUserPreferences(prev => ({ ...prev, locationLat: coords.lat, locationLon: coords.lon }));
                          } else {
                            setLocationError('Could not find this address. Please try a different one.');
                          }
                        }}
                      >
                        {locationLoading ? 'Setting...' : 'Set Location'}
                      </button>
                    </div>
                    {locationError && <p className="text-red-500 text-xs mt-2">{locationError}</p>}
                    {userPreferences.locationLat && userPreferences.locationLon && (
                      <p className="text-green-600 text-xs mt-2">Location set! AI will use this for chef suggestions.</p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => setStep(2)}
                      disabled={
                        !userPreferences.serviceType ||
                        !userPreferences.guestCount ||
                        !userPreferences.locationLat ||
                        !userPreferences.locationLon
                      }
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Get AI Recommendations 🚀
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: AI Recommendations */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      AI-Powered Chef Recommendations
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Based on your preferences, our AI has analyzed and ranked the best chefs for your event.
                    </p>
                  </div>

                  <AIChefRecommendations
                    userPreferences={userPreferences}
                    onRecommendationsReceived={handleAIRecommendations}
                  />

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!aiRecommendations}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                    >
                      Generate Menu →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Menu Generation */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      AI Menu Generator
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Let our AI create a personalized menu for your event.
                    </p>
                  </div>

                  <AIMenuGenerator
                    eventDetails={userPreferences}
                    onMenuGenerated={handleMenuGenerated}
                  />

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      Finalize Booking →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Final Booking */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Booking Summary
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <div className="text-green-800">
                        <h4 className="font-semibold text-lg mb-2">Your AI-Optimized Booking</h4>
                        <div className="text-left space-y-2">
                          <p><span className="font-medium">Event:</span> {userPreferences.serviceType}</p>
                          <p><span className="font-medium">Guests:</span> {userPreferences.guestCount}</p>
                          <p><span className="font-medium">Date:</span> {userPreferences.date}</p>
                          <p><span className="font-medium">Time:</span> {userPreferences.time}</p>
                          <p><span className="font-medium">Location:</span> {userPreferences.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
                      Confirm AI-Powered Booking ✨
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      ← Back to Menu
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          <div className="space-y-6">
            <AIChatAssistant />
            
            {/* AI Features Info */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                🚀 AI-Powered Features
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Smart Chef Matching</h4>
                    <p className="text-sm text-gray-600">AI analyzes preferences to find your perfect chef</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Menu Generation</h4>
                    <p className="text-sm text-gray-600">Personalized menus based on your event details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Price Optimization</h4>
                    <p className="text-sm text-gray-600">AI suggests optimal pricing for your budget</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-pink-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">24/7 Assistant</h4>
                    <p className="text-sm text-gray-600">Get cooking tips and answers anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookChef;
