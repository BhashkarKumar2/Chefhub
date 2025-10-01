import React from 'react';
import { useThemeAwareStyle } from '../utils/themeUtils';

const TextareaInput = ({ label, name, value, onChange, placeholder, required = false }) => {
  const { getClass, classes } = useThemeAwareStyle();
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className={getClass('text-sm font-medium text-gray-700', 'text-sm font-medium text-gray-200')}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={4}
        className={`px-4 py-2 rounded-xl border focus:ring-2 focus:ring-amber-500 focus:outline-none ${classes.input.bg} ${classes.input.border} ${classes.input.text} ${classes.input.placeholder}`}
      />
    </div>
  );
};

export default TextareaInput;