import React from 'react';
import { useThemeAwareStyle } from '../../utils/themeUtils';

const CheckboxGroup = ({ label, options, selectedOptions, onChange }) => {
  const { getClass, classes } = useThemeAwareStyle();
  return (
    <div className="flex flex-col gap-2">
      <label className={getClass('text-sm font-medium text-gray-700', 'text-sm font-medium text-gray-200')}>{label}</label>
      <div className="flex flex-wrap gap-3">
        {options.map((option, index) => (
          <label key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={option}
              checked={selectedOptions.includes(option)}
              onChange={() => onChange(option)}
              className={`w-4 h-4 rounded focus:ring-amber-500 ${classes.input.bg} ${classes.input.border}`}
            />
            <span className={getClass('text-gray-700 text-sm', 'text-gray-200 text-sm')}>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;
