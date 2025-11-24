import React from 'react';

const ImageUploader = ({ label, name, onChange, accept = 'image/*' }) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="file"
        id={name}
        name={name}
        accept={accept}
        onChange={onChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-orange-100"
      />
    </div>
  );
};

export default ImageUploader;
