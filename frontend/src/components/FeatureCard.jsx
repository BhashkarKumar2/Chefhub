import React from 'react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl border border-amber-200 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default React.memo(FeatureCard);
