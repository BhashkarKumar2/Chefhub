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
  const { getClass } = useThemeAwareStyle();
  const navigate = useNavigate();
  const [hoveredService, setHoveredService] = useState(null);

  const services = [
    {
      id: 'birthday',
      title: 'Birthday Celebrations',
      icon: Cake,
      gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
      glowColor: 'shadow-violet-500/50',
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
      gradient: 'from-rose-500 via-pink-600 to-red-600',
      glowColor: 'shadow-rose-500/50',
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
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      glowColor: 'shadow-orange-500/50',
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
      description: 'All our chefs are professionally trained and background-verified',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Premium ingredients and hygiene standards maintained',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description: 'Book services at your preferred time with real-time availability',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Flexible Options',
      description: 'From intimate gatherings to large events, we scale with you',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const handleBookService = (serviceId) => {
    navigate(`/chefs?service=${serviceId}`);
  };

  return (
    <div className={`min-h-screen ${getClass('bgPrimary')} lg:ml-10`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Premium Chef Services</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Culinary Excellence
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                For Every Occasion
              </span>
            </h1>

            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              From intimate birthday celebrations to grand wedding feasts and daily meal prep,
              our expert chefs bring restaurant-quality cuisine to your doorstep
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/chefs')}
                className="px-8 py-4 bg-white text-orange-600 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
              >
                Browse Chefs
              </button>
              <button
                onClick={() => document.getElementById('services-section').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-full font-semibold hover:bg-white/20 transition-all"
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
          <h2 className={`text-4xl md:text-5xl font-black mb-4 ${getClass('textPrimary')}`}>
            Our Services
          </h2>
          <p className={`text-xl ${getClass('textSecondary')} max-w-2xl mx-auto`}>
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
                className={`group relative rounded-2xl overflow-hidden ${getClass('bgSecondary')} border ${
                  hoveredService === service.id 
                    ? 'border-transparent shadow-2xl ' + service.glowColor
                    : 'border-gray-200 dark:border-gray-700 shadow-lg'
                } transition-all duration-300`}
              >
                {/* Popular Badge */}
                {service.popular && (
                  <div className="absolute top-4 right-4 z-20">
                    <div className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center gap-1.5 shadow-lg">
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
                  <h3 className={`text-2xl font-bold mb-3 ${getClass('textPrimary')}`}>
                    {service.title}
                  </h3>

                  <p className={`${getClass('textSecondary')} mb-6 leading-relaxed`}>
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-start gap-2.5 text-sm ${getClass('textSecondary')}`}>
                        <div className={`mt-0.5 p-0.5 rounded-full bg-gradient-to-r ${service.gradient}`}>
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Stats */}
                  <div className={`grid grid-cols-3 gap-3 p-4 rounded-xl ${getClass('bgPrimary')} border border-gray-200 dark:border-gray-700 mb-6`}>
                    {Object.entries(service.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className={`text-lg font-black bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                          {value}
                        </div>
                        <div className={`text-xs ${getClass('textMuted')} capitalize mt-1`}>{key}</div>
                      </div>
                    ))}
                  </div>

                  {/* Price & CTA */}
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm ${getClass('textMuted')}`}>{service.priceLabel}</span>
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
          <h3 className={`text-3xl md:text-4xl font-black text-center mb-12 ${getClass('textPrimary')}`}>
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
                  className={`relative rounded-2xl ${getClass('bgSecondary')} p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all group`}
                >
                  <div className={`inline-flex p-3 bg-gradient-to-br ${benefit.gradient} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-lg font-bold mb-2 ${getClass('textPrimary')}`}>
                    {benefit.title}
                  </h4>
                  <p className={`text-sm ${getClass('textSecondary')} leading-relaxed`}>
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
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
          
          {/* Animated Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>

          {/* Glowing Orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"></div>

          <div className="relative px-8 py-16 md:py-20 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-full mb-6">
                <Calendar className="w-12 h-12 text-orange-400" />
              </div>
              
              <h3 className="text-3xl md:text-5xl font-black text-white mb-4">
                Ready to Book Your
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Perfect Chef?
                </span>
              </h3>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Browse our curated selection of expert chefs and find the perfect match for your event
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/chefs')}
                className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-lg font-bold shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 transition-all inline-flex items-center gap-3"
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