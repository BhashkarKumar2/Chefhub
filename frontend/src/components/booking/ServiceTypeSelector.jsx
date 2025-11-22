import React from 'react';
import { serviceTypes } from './bookingConstants.jsx';

const ServiceTypeSelector = ({ selectedServiceType, onSelect, isDark }) => {
  return (
    <div>
      <label className="block text-lg font-semibold mb-4">1. Choose Service Type</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {serviceTypes.map((service) => (
          <div
            key={service.id}
            onClick={() => onSelect(service.id, service.minDuration)}
            className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all duration-200 ${
              selectedServiceType === service.id
                ? `border-orange-500 shadow-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`
                : `${isDark ? 'border-gray-700 hover:border-orange-500' : 'border-gray-200 hover:border-orange-500'}`
            }`}
          >
            {service.icon}
            <h4 className={`font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{service.name}</h4>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{service.minDuration}-{service.maxDuration}h</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTypeSelector;
