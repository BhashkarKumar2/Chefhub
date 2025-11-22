import React from 'react';
import { getPricingBreakdown } from './bookingUtils';

const PricingSummary = ({ selectedChef, bookingDetails, total, isDark }) => {
  const breakdown = getPricingBreakdown(selectedChef, bookingDetails);

  if (!breakdown) return null;

  const labels = {
    baseRate: 'Base Rate (/hr)',
    duration: 'Duration (hrs)',
    baseTotal: 'Subtotal (Base)',
    addOnTotal: 'Add-ons Total',
    subtotal: 'Subtotal',
  };

  return (
    <div className={`rounded-2xl shadow-lg p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Price Summary</h3>
      <div className="space-y-2 text-sm">
        {Object.entries(breakdown).map(([key, value]) => {
          if (['total', 'guestMultiplier'].includes(key) || !value) return null;
          return (
            <div key={key} className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{labels[key]}</span>
              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {key.includes('Total') || key.includes('Fee') || key.includes('Rate') ? `₹${Math.round(value)}` : value}
              </span>
            </div>
          );
        })}
      </div>
      <div className={`border-t my-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>
      <div className="flex justify-between items-center">
        <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Total</span>
        <span className="text-2xl font-bold text-orange-500">₹{total}</span>
      </div>
    </div>
  );
};

export default PricingSummary;
