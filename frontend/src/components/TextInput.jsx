import React from 'react';

const TextInput = ({ label, name, value, onChange, placeholder, type = 'text', required = false }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
};

export default TextInput;

// <TextInput
//   label="Full Name"
//   name="fullName"
//   value={form.fullName}
//   onChange={handleChange}
//   placeholder="Enter your full name"
//   required
// />