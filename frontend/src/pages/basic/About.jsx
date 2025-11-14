import React from 'react';
import { useThemeAwareStyle } from '../../utils/themeUtils';

const About = () => {
  const { theme, classes, isDark, getClass } = useThemeAwareStyle();
  
  return (
    <div className={`min-h-screen ${getClass('bgPrimary')}`}>
      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-20`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mb-8">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6V5a2 2 0 114 0v1H8zm2 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h1 className={`text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent ${isDark ? 'from-yellow-100 to-yellow-300' : ''}`}>
            About Cooks
          </h1>
          <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95`}>
            Connecting food lovers with exceptional chefs for unforgettable culinary experiences
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm opacity-90">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
              500+ Verified Chefs
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
              10,000+ Happy Customers
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
              50+ Cities
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-white/15 rounded-full animate-bounce"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Story Section */}
        <div className={`text-center mb-16`}>
          <h2 className={`text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6 ${isDark ? 'from-yellow-400 to-yellow-600' : ''}`}>
            Our Story
          </h2>
          <p className={`text-lg max-w-4xl mx-auto leading-relaxed ${getClass('textSecondary')}`}>
            Welcome to <span className="font-semibold text-orange-600">Cooks</span> – your premium platform connecting food enthusiasts with exceptional professional chefs. Whether you're planning an intimate dinner, celebrating special occasions, or hosting memorable events, we bring restaurant-quality culinary experiences directly to your home.
          </p>
        </div>

        {/* Feature Cards - Updated with theme support */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Card 1 */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border`}>
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Verified Professionals</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              Every chef on our platform is thoroughly vetted, background-checked, and professionally trained to ensure exceptional service quality.
            </p>
          </div>

          {/* Card 2 */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border`}>
            <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Transparent Pricing</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              No hidden fees, no surprises. Clear, upfront pricing with detailed breakdowns so you know exactly what you're paying for.
            </p>
          </div>

          {/* Card 3 */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border`}>
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Seamless Experience</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              From booking to cleanup, we handle every detail so you can focus on enjoying exceptional food with your loved ones.
            </p>
          </div>
        </div>

        {/* Mission & Vision - Updated Mission card with fixed gradient and Vision card with theme support */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Mission - Orange gradient stays the same in both modes */}
          <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-3xl p-8 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
            <p className="text-lg leading-relaxed opacity-95">
              To democratize fine dining by making exceptional culinary experiences accessible to everyone, while empowering talented chefs to showcase their skills and build sustainable careers.
            </p>
          </div>

          {/* Vision - Updated with theme support */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-3xl p-8 shadow-lg border`}>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </div>
            <h3 className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Our Vision</h3>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              To become the world's most trusted culinary platform, transforming how people experience food at home and creating a thriving ecosystem for culinary professionals globally.
            </p>
          </div>
        </div>

        {/* Values - Updated heading and cards with theme support */}
        <div className="text-center">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-8">
            Why Choose Cooks?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "", title: "Premium Quality", desc: "Only the finest chefs and ingredients" },
              { icon: "", title: "Quick Booking", desc: "Book your chef in under 2 minutes" },
              { icon: "", title: "Memorable Events", desc: "Creating unforgettable dining experiences" },
              { icon: "", title: "5-Star Service", desc: "Rated excellent by thousands of customers" }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h4 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-2`}>{item.title}</h4>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
