import React from 'react';
import { FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';
import { serviceTypes } from './bookingConstants';

const BookingScheduleForm = ({ 
  bookingDetails, 
  setBookingDetails, 
  isDark 
}) => {
  const selectedService = serviceTypes.find(s => s.id === bookingDetails.serviceType);

  return (
    <div>
      <label className="block text-lg font-semibold mb-4">2. Schedule & Details</label>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        
        {/* Conditional Fields for Daily Cook */}
        {bookingDetails.serviceType === 'daily' ? (
          <>
            <div>
              <label className={`flex items-center text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <FaCalendarAlt className="mr-2 text-orange-500"/>Start Date *
              </label>
              <input
                type="date"
                value={bookingDetails.date}
                onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className={`flex items-center text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <FaClock className="mr-2 text-orange-500"/>Booking Duration *
              </label>
              <select
                value={bookingDetails.bookingDuration || ''}
                onChange={(e) => setBookingDetails({ ...bookingDetails, bookingDuration: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                required
              >
                <option value="">Select duration</option>
                <option value="1-week">1 Week</option>
                <option value="2-weeks">2 Weeks</option>
                <option value="1-month">1 Month</option>
                <option value="3-months">3 Months</option>
              </select>
            </div>
          </>
        ) : (
          <>
            {/* Date */}
            <div>
              <label className={`flex items-center text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <FaCalendarAlt className="mr-2 text-orange-500"/>Date *
              </label>
              <input
                type="date"
                value={bookingDetails.date}
                onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            {/* Time */}
            <div>
              <label className={`flex items-center text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <FaClock className="mr-2 text-orange-500"/>Time *
              </label>
              <input
                type="time"
                value={bookingDetails.time}
                onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                required
              />
            </div>
          </>
        )}
        
        {/* Guests */}
        <div className="md:col-span-2">
          <label className={`flex items-center text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <FaUsers className="mr-2 text-orange-500"/>Number of Guests *
          </label>
          <input
            type="number"
            placeholder="How many people?"
            value={bookingDetails.guestCount}
            onChange={(e) => setBookingDetails({ ...bookingDetails, guestCount: e.target.value })}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
            min="1"
            required
          />
        </div>
        
        {/* Duration */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Duration: {bookingDetails.duration} hours
          </label>
          <input
            type="range"
            min={selectedService?.minDuration || 2}
            max={selectedService?.maxDuration || 8}
            value={bookingDetails.duration}
            onChange={(e) => setBookingDetails({ ...bookingDetails, duration: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
          />
        </div>

        {/* Service-Specific Fields */}
        <div className="md:col-span-2 space-y-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-orange-500">Event Specifics</h4>
          
          {bookingDetails.serviceType === 'birthday' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Age Group</label>
                <select 
                  value={bookingDetails.ageGroup || ''} 
                  onChange={(e) => setBookingDetails({ ...bookingDetails, ageGroup: e.target.value })} 
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                >
                  <option value="">Select</option>
                  <option value="kids">Kids</option>
                  <option value="teens">Teens</option>
                  <option value="adults">Adults</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Party Theme</label>
                <input 
                  type="text" 
                  placeholder="e.g., Superhero" 
                  value={bookingDetails.partyTheme || ''} 
                  onChange={(e) => setBookingDetails({ ...bookingDetails, partyTheme: e.target.value })} 
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`} 
                />
              </div>
            </div>
          )}
          
          {bookingDetails.serviceType === 'marriage' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Wedding Type</label>
                <select 
                  value={bookingDetails.weddingType || ''} 
                  onChange={(e) => setBookingDetails({ ...bookingDetails, weddingType: e.target.value })} 
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                >
                  <option value="">Select</option>
                  <option value="traditional">Traditional</option>
                  <option value="modern">Modern</option>
                  <option value="destination">Destination</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Number of Courses</label>
                <select 
                  value={bookingDetails.coursesCount || ''} 
                  onChange={(e) => setBookingDetails({ ...bookingDetails, coursesCount: e.target.value })} 
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                >
                  <option value="">Select</option>
                  <option value="3">3 Courses</option>
                  <option value="5">5 Courses</option>
                  <option value="7">7 Courses</option>
                </select>
              </div>
            </div>
          )}
          
          {bookingDetails.serviceType === 'daily' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Meal Type</label>
                <select 
                  value={bookingDetails.mealType || ''} 
                  onChange={(e) => setBookingDetails({ ...bookingDetails, mealType: e.target.value })} 
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                >
                  <option value="">Select</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="all">All Meals</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dietary Preference</label>
                <select 
                  value={bookingDetails.dietaryPreference || ''} 
                  onChange={(e) => setBookingDetails({ ...bookingDetails, dietaryPreference: e.target.value })} 
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                >
                  <option value="">Select</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Frequency</label>
                <select
                  value={bookingDetails.frequency || ''}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, frequency: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${isDark ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-orange-500'}`}
                >
                  <option value="">Select frequency</option>
                  <option value="daily">Daily (7 days/week)</option>
                  <option value="weekdays">Weekdays Only (5 days/week)</option>
                  <option value="weekends">Weekends Only</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingScheduleForm;
