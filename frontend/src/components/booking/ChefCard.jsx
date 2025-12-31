import React from 'react';
import { FaStar, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import FavoriteButton from '../features/FavoriteButton';

const ChefCard = ({ chef, onSelect, isDark, getClass, canBook = true }) => {
  return (
    <div className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border overflow-hidden flex flex-col ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="relative">
        <img
          src={chef.profileImage?.url || chef.photo || 'https://images.unsplash.com/photo-1659354219145-dedd2324698e?w=600&auto=format&fit=crop&q=60'}
          alt={chef.name || chef.fullName}
          className="w-full h-56 object-cover"
        />

        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t ${isDark ? 'from-gray-800 to-transparent' : 'from-white to-transparent'}`}>
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {chef.name || chef.fullName}
          </h3>
          {chef.specialty && (
            <p className="text-orange-500 font-semibold">{chef.specialty}</p>
          )}
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className={getClass('flex items-center gap-1.5 text-sm', 'flex items-center gap-1.5 text-sm')}>
            <FaStar className="text-amber-500" />
            <span className={getClass('font-semibold text-gray-700', 'font-semibold text-gray-300')}>
              {chef.averageRating ? chef.averageRating.toFixed(1) : 'New'}
            </span>
            <span className={getClass('text-gray-500', 'text-gray-400')}>
              ({chef.totalReviews || 0})
            </span>
          </div>
          {chef.experienceYears && (
            <div className={getClass('flex items-center gap-1.5 text-sm', 'flex items-center gap-1.5 text-sm')}>
              <FaCalendarAlt className="text-orange-500" />
              <span className={getClass('font-medium text-gray-700', 'font-medium text-gray-300')}>{chef.experienceYears} yrs exp.</span>
            </div>
          )}
        </div>

        <p className={`text-sm leading-relaxed mb-4 flex-grow line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {chef.bio || 'An experienced professional chef ready to create exceptional culinary experiences for you.'}
        </p>

        <div className="flex items-start gap-2 mb-5 text-sm">
          <FaMapMarkerAlt className="text-orange-500 flex-shrink-0 mt-1" />
          <div className="flex-grow">
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {chef.address || (Array.isArray(chef.serviceableLocations) && chef.serviceableLocations[0]) || 'Location not set'}
            </p>
            {typeof chef.distance === 'number' && isFinite(chef.distance) && (
              <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                📍 {(chef.distance / 1000).toFixed(1)} km away from you
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex gap-3">
          <button
            onClick={() => onSelect(chef)}
            disabled={!canBook}
            title={!canBook ? 'Set your service location to enable booking' : undefined}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 transform
              ${canBook ? 'bg-orange-600 text-white hover:bg-orange-700 group-hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
          >
            {canBook ? 'Book Now' : 'Set Location to Book'}
          </button>

          <FavoriteButton
            chef={chef}
            variant="icon"
            className={`px-4 py-3 rounded-lg shadow-md border transition-all duration-300 transform group-hover:scale-105 ${isDark
                ? 'bg-gray-700 border-gray-600 text-amber-400 hover:bg-gray-600'
                : 'bg-white border-gray-200 text-amber-500 hover:bg-amber-50'
              }`}
          />
        </div>
      </div>
    </div>
  );
};

export default ChefCard;
