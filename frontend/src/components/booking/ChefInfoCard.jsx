import React from 'react';

const ChefInfoCard = ({ chef, isDark }) => {
  return (
    <div className={`rounded-2xl shadow-lg overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <img
        src={chef.profileImage?.url || chef.photo || 'https://images.unsplash.com/photo-1659354219145-dedd2324698e?w=600&auto=format&fit=crop&q=60'}
        alt={chef.name || chef.fullName}
        className="w-full h-64 object-cover"
      />
      <div className="p-6">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {chef.name || chef.fullName}
        </h2>
        <p className="text-lg text-orange-500 font-semibold mt-1">{chef.specialty}</p>
        <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{chef.bio}</p>
        <div className={`mt-4 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          ₹{chef.pricePerHour || chef.rate || 1200}
          <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/hour (base rate)</span>
        </div>
      </div>
    </div>
  );
};

export default ChefInfoCard;
