import React from 'react';

const GuestSelector = ({ guests, onChange }) => {
  return (
    <div className="flex flex-col gap-1 w-1/2">
      <label className="text-sm font-medium text-gray-700">Guest Count</label>
      <input
        type="number"
        min={1}
        value={guests}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
};

export default GuestSelector;