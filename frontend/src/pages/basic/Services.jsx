import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThemeAwareStyle } from '../../utils/themeUtils';
import { 
  Cake, 
  Heart, 
  UtensilsCrossed, 
  Users, 
  Star,
  Clock,
  ChefHat,
  Sparkles,
  Calendar,
  ArrowRight,
  Check,
  Zap,
  Award,
  Shield,
  TrendingUp
} from 'lucide-react';

const Services = () => {
  const { getClass, isDark } = useThemeAwareStyle();
  const navigate = useNavigate();
  const [hoveredService, setHoveredService] = useState(null);

  const services = [
    {
      id: 'birthday',
      title: 'Birthday Celebrations',
      icon: Cake,
      gradient: 'from-orange-500 via-orange-600 to-orange-700',
      glowColor: 'shadow-orange-500/50',
      description: 'Make birthdays unforgettable with personalized chef services',
      features: [
        'Customized birthday menus',
        'Themed cuisine options',
        'Professional presentation',
        'Kids-friendly options',
        'Dietary accommodations',
        'Interactive cooking sessions'
      ],
      price: '₹2,999',
      priceLabel: 'Starting from',
      popular: true,
      stats: { chefs: '150+', events: '500+', rating: '4.8' }
    },
    {
      id: 'marriage',
      title: 'Wedding & Events',
      icon: Heart,
      gradient: 'from-orange-600 via-orange-700 to-amber-600',
      glowColor: 'shadow-orange-600/50',
      description: 'Elevate your special day with exquisite culinary experiences',
      features: [
        'Multi-cuisine wedding menus',
        'Large-scale catering',
        'Professional staff',
        'Traditional & modern fusion',
        'Pre-wedding consultations',
        'Live cooking stations'
      ],
      price: '₹15,999',
      priceLabel: 'Starting from',
      popular: false,
      stats: { chefs: '80+', events: '200+', rating: '4.9' }
    },
    {
      id: 'daily',
      title: 'Daily Meals',
      icon: UtensilsCrossed,
      gradient: 'from-amber-500 via-orange-500 to-orange-600',
      glowColor: 'shadow-amber-500/50',
      description: 'Enjoy healthy, home-cooked meals prepared by expert chefs daily',
      features: [
        'Weekly meal planning',
        'Breakfast, lunch & dinner',
        'Nutritionist-approved menus',
        'Fresh ingredients daily',
        'Flexible scheduling',
        'Special diet plans'
      ],
      price: '₹499/day',
      priceLabel: 'Starting from',
      popular: false,
      stats: { chefs: '200+', customers: '1000+', rating: '4.7' }
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Verified Expert Chefs',
      description: 'All our chefs are professionally trained and background-verified'
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Premium ingredients and hygiene standards maintained'
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description: 'Book services at your preferred time with real-time availability'
    },
    {
      icon: TrendingUp,
      title: 'Flexible Options',
      description: 'From intimate gatherings to large events, we scale with you'
    }
  ];

  const handleBookService = (serviceId) => {
    navigate(`/book-chef?service=${serviceId}`);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} lg:ml-10`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-white/15 rounded-full animate-bounce"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-white/10' : 'bg-white/30'} backdrop-blur-sm rounded-full mb-6`}>
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Premium Chef Services</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Culinary Excellence
              <br />
              <span className="bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                For Every Occasion
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-95">
              From intimate birthday celebrations to grand wedding feasts and daily meal prep,
              our expert chefs bring restaurant-quality cuisine to your doorstep
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/book-chef')}
                className={`px-8 py-4 ${isDark ? 'bg-white text-orange-600' : 'bg-white text-orange-600'} rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg`}
              >
                Browse Chefs
              </button>
              <button
                onClick={() => document.getElementById('services-section').scrollIntoView({ behavior: 'smooth' })}
                className={`px-8 py-4 ${isDark ? 'bg-white/10' : 'bg-white/20'} backdrop-blur-sm text-white border-2 border-white rounded-full font-semibold hover:bg-white/20 transition-all`}
              >
                Explore Services
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Services Section */}
      <div id="services-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Our Services
          </h2>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Premium chef experiences tailored to your occasion
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
                className={`group relative rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                  hoveredService === service.id 
                    ? 'border-transparent shadow-2xl ' + service.glowColor
                    : 'border-gray-200 dark:border-gray-700 shadow-lg'
                } transition-all duration-300`}
              >
                {/* Popular Badge */}
                {service.popular && (
                  <div className="absolute top-4 right-4 z-20">
                    <div className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Star className="w-3.5 h-3.5 text-white fill-current" />
                      <span className="text-white text-xs font-bold">POPULAR</span>
                    </div>
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`relative h-2 bg-gradient-to-r ${service.gradient}`}></div>

                <div className="p-8">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.gradient} shadow-lg ${service.glowColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {service.title}
                  </h3>

                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6 leading-relaxed`}>
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-start gap-2.5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className={`mt-0.5 p-0.5 rounded-full bg-gradient-to-r ${service.gradient}`}>
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Stats */}
                  <div className={`grid grid-cols-3 gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'} border border-gray-200 dark:border-gray-700 mb-6`}>
                    {Object.entries(service.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className={`text-lg font-black bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                          {value}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} capitalize mt-1`}>{key}</div>
                      </div>
                    ))}
                  </div>

                  {/* Price & CTA */}
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{service.priceLabel}</span>
                      <span className={`text-3xl font-black bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                        {service.price}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBookService(service.id)}
                      className={`w-full py-4 bg-gradient-to-r ${service.gradient} text-white rounded-xl font-bold shadow-lg ${service.glowColor} hover:shadow-2xl transition-all flex items-center justify-center gap-2 group`}
                    >
                      Book Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modern Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className={`text-3xl md:text-4xl font-black text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Why Choose ChefHub?
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`relative rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all group`}
                >
                  <div className={`inline-flex p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {benefit.title}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        {/* Modern CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700"></div>
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Floating decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/15 rounded-full animate-bounce"></div>

          <div className="relative px-8 py-16 md:py-20 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className={`inline-flex p-4 ${isDark ? 'bg-white/10' : 'bg-white/20'} backdrop-blur-md rounded-full mb-6`}>
                <Calendar className="w-12 h-12 text-orange-300" />
              </div>
              
              <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                Ready to Book Your
                <br />
                <span className="bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  Perfect Chef?
                </span>
              </h3>
              
              <p className="text-lg md:text-xl text-white opacity-95 mb-8 max-w-2xl mx-auto leading-relaxed">
                Browse our curated selection of expert chefs and find the perfect match for your event
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/book-chef')}
                className={`group px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-lg font-bold shadow-2xl ${isDark ? 'shadow-orange-500/30' : 'shadow-orange-500/50'} hover:shadow-orange-500/70 transition-all inline-flex items-center gap-3`}
              >
                Explore Chefs
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;