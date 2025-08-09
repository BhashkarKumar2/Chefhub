import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../contexts/FavoritesContext';
import FavoriteButton from '../../components/FavoriteButton';

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

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
        longitude: coordinates[0]
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const Favorites = () => {
  const { favorites, removeFromFavorites } = useFavorites();
  const [filter, setFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleLocationSearch = async () => {
    if (!locationFilter.trim()) return;
    
    setIsLoadingLocation(true);
    try {
      const coordinates = await geocodeAddress(locationFilter);
      if (coordinates) {
        setUserLocation(coordinates);
      } else {
        alert('Location not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Location search error:', error);
      alert('Error searching for location. Please try again.');
    }
    setIsLoadingLocation(false);
  };

  const clearLocationFilter = () => {
    setUserLocation(null);
    setLocationFilter('');
  };

  let filteredChefs = filter === 'all' 
    ? favorites 
    : favorites.filter(chef => 
        chef.specialty?.toLowerCase().includes(filter.toLowerCase()) ||
        chef.name?.toLowerCase().includes(filter.toLowerCase())
      );

  // Apply location filtering if user location is set
  if (userLocation) {
    filteredChefs = filteredChefs.map(chef => {
      if (chef.locationCoords) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          chef.locationCoords.lat,
          chef.locationCoords.lon
        );
        return { ...chef, distance };
      }
      return chef;
    }).sort((a, b) => {
      if (a.distance && b.distance) return a.distance - b.distance;
      if (a.distance) return -1;
      if (b.distance) return 1;
      return 0;
    });
  }

  const cuisineTypes = ['all', 'indian', 'italian', 'american', 'british', 'chinese', 'thai'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mb-8">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
            Your Favorite Chefs
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95">
            Your carefully curated collection of exceptional chefs, ready to create memorable culinary experiences
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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {favorites.length} Saved Chef{favorites.length !== 1 ? 's' : ''}
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Filter by cuisine:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
                >
                  {cuisineTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Enter your location to sort by distance..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLocationSearch}
                  disabled={isLoadingLocation || !locationFilter.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoadingLocation ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                          <animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      Sort by Distance
                    </>
                  )}
                </button>
                {userLocation && (
                  <button
                    onClick={clearLocationFilter}
                    className="bg-gray-100 text-gray-600 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </div>
            {userLocation && (
              <p className="text-sm text-purple-600 mt-2 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Showing chefs sorted by distance from your location
              </p>
            )}
          </div>
        </div>

        {/* Chefs Grid */}
        {filteredChefs.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">No favorite chefs yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start exploring our amazing chefs and save your favorites to see them here.
            </p>
            <Link 
              to="/book-chef" 
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
            >
              Discover Chefs
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {filteredChefs.map((chef) => (
              <div key={chef._id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100 overflow-hidden">
                <div className="relative">
                  <img
                    src={chef.profileImage?.url || 'https://images.unsplash.com/photo-1559847844-d963b5de7901?w=400&auto=format&fit=crop&q=60'}
                    alt={chef.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1">
                    <span className="text-purple-600 font-bold text-lg">₹{chef.pricePerHour}/hr</span>
                  </div>
                  <div className="absolute top-2 left-15">
                    <FavoriteButton chef={chef} variant="card" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    {chef.name}
                  </h3>
                  <p className="text-purple-600 font-semibold mb-2">{chef.specialty}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{chef.bio}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                      </svg>
                      {chef.distance ? (
                        <span className="font-medium text-purple-600">
                          {chef.distance.toFixed(1)} km away
                        </span>
                      ) : (
                        chef.serviceableLocations?.length > 0 ? chef.serviceableLocations[0] : 'Location not specified'
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                      </svg>
                      {chef.experienceYears} years experience
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">(4.5)</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link 
                      to={`/book-chef?chef=${chef._id}`}
                      className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
                    >
                      Book Now
                    </Link>
                    <button
                      onClick={() => removeFromFavorites(chef._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 border border-red-200 font-semibold"
                      title="Remove from favorites"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {filteredChefs.length > 0 && (
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white">
              <h3 className="text-3xl font-bold mb-4">Ready to Book Your Next Experience?</h3>
              <p className="text-xl mb-8 opacity-95">Choose from your favorite chefs and create unforgettable memories</p>
              <Link 
                to="/book-chef" 
                className="inline-flex items-center px-8 py-3 bg-white text-purple-600 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
              >
                Explore More Chefs
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

export default Favorites;
