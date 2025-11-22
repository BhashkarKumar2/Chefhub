import React from 'react';
import { getAddOnsForService } from './bookingConstants.jsx';

const AddOnsSelector = ({ 
  serviceType, 
  selectedAddOns, 
  onToggle, 
  isDark 
}) => {
  const addOns = getAddOnsForService(serviceType);

  return (
    <div>
      <label className="block text-lg font-semibold mb-4">3. Premium Add-ons</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addOns.map((addOn) => (
          <div
            key={addOn.name}
            onClick={() => onToggle(addOn.name)}
            className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 ${
              selectedAddOns.includes(addOn.name)
                ? `border-orange-500 shadow-md ${isDark ? 'bg-gray-700' : 'bg-white'}`
                : `${isDark ? 'border-gray-700 hover:border-orange-500' : 'border-gray-200 hover:border-orange-500'}`
            }`}
          >
            <div className="flex-shrink-0">{addOn.icon}</div>
            <div className="flex-grow">
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{addOn.name}</h4>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{addOn.description}</p>
            </div>
            <p className={`font-bold text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>+₹{addOn.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddOnsSelector;
