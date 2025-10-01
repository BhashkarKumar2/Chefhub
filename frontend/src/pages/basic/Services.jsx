import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeAwareStyle } from '../../utils/themeUtils';

const Services = () => {
  const { theme, classes, isDark, getClass } = useThemeAwareStyle();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Navigation functions
  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate('/book-chef');
    } else {
      navigate('/login', { state: { from: { pathname: '/book-chef' } } });
    }
  };

  const handleBrowseChefs = () => {
    if (isAuthenticated) {
      navigate('/book-chef');
    } else {
      navigate('/login', { state: { from: { pathname: '/book-chef' } } });
    }
  };

  const handleCustomQuote = () => {
    navigate('/contact');
  };

  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
        </svg>
      ),
      title: "Private Chef Experience",
      description: "Hire professional chefs for intimate dining experiences at home",
      features: ["Personal menu consultation", "Fresh ingredient sourcing", "Professional cooking service", "Table service & presentation"],
      price: "Starting from $150",
  gradient: "from-orange-600 to-amber-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
        </svg>
      ),
      title: "Event Catering",
      description: "Full-service catering for special occasions and celebrations",
      features: ["Custom menu design", "Event planning assistance", "Professional staff", "Setup & cleanup service"],
      price: "Starting from $25/person",
  gradient: "from-orange-400 to-amber-400"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
        </svg>
      ),
      title: "Corporate Catering",
      description: "Professional catering solutions for business events and meetings",
      features: ["Business-friendly menus", "Flexible scheduling", "Professional presentation", "Dietary accommodations"],
      price: "Custom pricing",
  gradient: "from-orange-600 to-amber-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      ),
      title: "Premium Experiences",
      description: "Luxury dining experiences with celebrity chefs and exclusive menus",
      features: ["Celebrity chef access", "Exclusive wine pairings", "Multi-course tasting menus", "Personalized service"],
      price: "Starting from $500",
  gradient: "from-orange-500 to-amber-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
        </svg>
      ),
      title: "Special Occasions",
      description: "Memorable dining for birthdays, anniversaries, and romantic dinners",
      features: ["Romantic table settings", "Special dietary options", "Surprise coordination", "Photography assistance"],
      price: "Starting from $200",
  gradient: "from-orange-400 to-amber-400"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
      ),
      title: "Add-On Services",
      description: "Enhanced services to make your event truly spectacular",
      features: ["Professional decoration", "Complete cleanup service", "Mixology & bar service", "Live cooking demonstrations"],
      price: "À la carte pricing",
  gradient: "from-orange-400 to-amber-400"
    }
  ];

  return (
    <div className={`min-h-screen ${getClass('bgPrimary')}`}>
      {/* Hero Section */}
  <div className={`relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-20`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mb-8">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className={`text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent ${isDark ? 'from-yellow-100 to-yellow-300' : ''}`}>
            Our Services
          </h1>
          <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95`}>
            From intimate dinners to grand celebrations, we deliver exceptional culinary experiences tailored to your needs
          </p>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-white/15 rounded-full animate-bounce"></div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
            Choose Your Experience
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Every service is designed to exceed your expectations with professional chefs, premium ingredients, and exceptional attention to detail.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className={`group ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border`}
            >
              {/* Service Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>

              {/* Service Title */}
              <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-100 group-hover:text-orange-400' : 'text-gray-800 group-hover:text-orange-600'} mb-4 transition-colors duration-300`}>
                {service.title}
              </h3>

              {/* Service Description */}
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6 leading-relaxed`}>
                {service.description}
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing */}
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{service.price}</span>
                <button 
                  className={`px-6 py-2 bg-gradient-to-r ${service.gradient} text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm font-semibold`}
                  onClick={handleBookNow}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Create Something Amazing?</h3>
            <p className="text-xl mb-8 opacity-95">Let our expert chefs transform your next meal into an unforgettable experience</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-8 py-3 bg-white text-orange-600 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
                onClick={handleBrowseChefs}
              >
                Browse Chefs
              </button>
              <button 
                className="px-8 py-3 border-2 border-white text-white rounded-xl hover:bg-white hover:text-orange-600 transition-all duration-300 hover:scale-105 font-semibold"
                onClick={handleCustomQuote}
              >
                Custom Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
