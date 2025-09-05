import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buildApiEndpoint } from '../../utils/apiConfig';
import FavoriteButton from '../../components/FavoriteButton';

const Chefs = () => {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const cuisineTypes = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Thai', 'French', 'Japanese', 'Mediterranean'];
  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];

  useEffect(() => {
    fetchChefs();
  }, [searchTerm, selectedCuisine, selectedLocation]);

  const fetchChefs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm); // Use 'q' instead of 'search'
      if (selectedCuisine) params.append('cuisine', selectedCuisine);
      if (selectedLocation) params.append('location', selectedLocation);

      const queryString = params.toString();
      const endpoint = queryString ? `/chefs/search?${queryString}` : '/chefs';
      
      console.log('🔍 Fetching chefs from:', buildApiEndpoint(endpoint));

      const response = await fetch(buildApiEndpoint(endpoint), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chefs: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Chefs fetched:', data);
      console.log('📊 Response structure:', {
        hasChefs: !!data.chefs,
        hasData: !!data.data,
        chefCount: data.chefs?.length || data.data?.length || 0,
        responseKeys: Object.keys(data)
      });
      
      setChefs(data.chefs || data.data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching chefs:', err);
      console.error('📋 Error details:', {
        message: err.message,
        stack: err.stack?.split('\n')[0] // First line of stack trace
      });
      setError(err.message);
      setChefs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCuisineChange = (e) => {
    setSelectedCuisine(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCuisine('');
    setSelectedLocation('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading amazing chefs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mb-6">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Our Talented Chefs
            </h1>
            <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto">
              Discover professional chefs ready to create amazing culinary experiences for you
            </p>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-12 h-12 bg-white/15 rounded-full animate-bounce"></div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Chefs</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name, specialty, or description..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Cuisine Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
              <select
                value={selectedCuisine}
                onChange={handleCuisineChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Cuisines</option>
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={handleLocationChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedCuisine || selectedLocation) && (
            <div className="mt-4 text-center">
              <button
                onClick={clearFilters}
                className="px-6 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-300"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              <div>
                <p className="text-red-800 font-medium">Error loading chefs</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-lg text-gray-700">
            {chefs.length === 0 ? 'No chefs found' : 
             chefs.length === 1 ? '1 chef found' : 
             `${chefs.length} chefs found`}
          </p>
        </div>

        {/* Chefs Grid */}
        {chefs.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No chefs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or clear the filters.</p>
            {(searchTerm || selectedCuisine || selectedLocation) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chefs.map((chef) => (
              <div key={chef._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Chef Image */}
                <div className="relative h-64 bg-gradient-to-br from-purple-400 to-blue-500">
                  {chef.profileImage?.url ? (
                    <img
                      src={chef.profileImage.url}
                      alt={chef.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <div className="absolute top-4 right-4">
                    <FavoriteButton chef={chef} />
                  </div>

                  
                </div>

                {/* Chef Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{chef.name}</h3>
                  
                  {/* Specialties */}
                  {chef.specialty && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                          {chef.specialty}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {chef.experienceYears && (
                    <p className="text-gray-600 mb-3">
                      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                      </svg>
                      {chef.experienceYears} years experience
                    </p>
                  )}

                  {/* Location */}
                  {(chef.city || chef.address) && (
                    <p className="text-gray-600 mb-4">
                      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                      </svg>
                      {chef.city || chef.address}
                    </p>
                  )}

                  {/* Pricing */}
                  {chef.pricePerHour && (
                    <p className="text-lg font-semibold text-purple-600 mb-4">
                      ₹{chef.pricePerHour}/hour
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Link
                      to={`/chef/${chef._id}`}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={`/book/${chef._id}`}
                      className="flex-1 px-4 py-2 border-2 border-purple-600 text-purple-600 text-center rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300"
                    >
                      Book Now
                    </Link>
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

export default Chefs;
