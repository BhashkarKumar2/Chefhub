import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useThemeAwareStyle } from '../../utils/themeUtils';
import logo from '../../assets/logo.png';

const geocodeAddress = async (address) => {
  try {
    const response = await api.get(`/proxy/geocode?address=${encodeURIComponent(address)}`);
    const data = response.data;
    if (data.success && data.data) {
      return {
        latitude: data.data.latitude,
        longitude: data.data.longitude,
        address: data.data.fullResponse?.features?.[0]?.properties?.label || address
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const services = [
  {
    title: 'Private Chef',
    description: 'Book a verified chef for dinners, parties, and family gatherings at home.'
  },
  {
    title: 'Daily Cooking',
    description: 'Find trusted cooks for recurring meals, meal prep, and home-style food.'
  },
  {
    title: 'AI Booking Help',
    description: 'Use the booking agent to plan menus, estimate prices, and draft bookings safely.'
  }
];

const contactItems = [
  { label: 'Email', value: 'support@chefhub.com' },
  { label: 'Hours', value: '10:00 AM - 8:00 PM' },
  { label: 'Support', value: 'Bookings, chefs, and account help' }
];

const Home = () => {
  const { classes, isDark, getClass } = useThemeAwareStyle();
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!location.hash) return;
    const target = document.querySelector(location.hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const canUseProtectedFlow = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return isAuthenticated && user && user.id && token;
  };

  const handleBookingClick = (e) => {
    e.preventDefault();
    if (isLoading) return;
    navigate(canUseProtectedFlow() ? '/book-chef' : '/register', {
      state: canUseProtectedFlow() ? undefined : { redirectTo: '/book-chef' }
    });
  };

  const handleAIFeaturesClick = (e) => {
    e.preventDefault();
    if (isLoading) return;
    navigate(canUseProtectedFlow() ? '/ai-features' : '/register', {
      state: canUseProtectedFlow() ? undefined : { redirectTo: '/ai-features' }
    });
  };

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!searchLocation.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setIsSearching(true);
    try {
      const locationData = await geocodeAddress(searchLocation);
      if (!locationData) {
        toast.error('Location not found. Please try a different address.');
        return;
      }

      navigate('/book-chef', {
        state: {
          searchLocation: locationData.address,
          coordinates: {
            lat: locationData.latitude,
            lon: locationData.longitude
          }
        }
      });
    } catch {
      toast.error('Error searching for location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`${getClass('bgSecondary')} min-h-screen`}>
      <section className={`relative overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-orange-50'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="ChefHub" className="w-14 h-14 object-contain" />
                <span className={`text-sm font-semibold uppercase tracking-wide ${classes.text.secondary}`}>
                  ChefHub
                </span>
              </div>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight ${classes.text.heading}`}>
                Book trusted chefs for home meals and events.
              </h1>
              <p className={`mt-5 text-lg max-w-2xl leading-relaxed ${classes.text.secondary}`}>
                Find verified chefs, plan your menu, estimate pricing, and create a safe draft booking before paying.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBookingClick}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Book a Chef'}
                </button>
                <button
                  onClick={handleAIFeaturesClick}
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-lg border font-semibold transition-colors ${isDark ? 'border-orange-500 text-orange-300 hover:bg-orange-950' : 'border-orange-600 text-orange-700 hover:bg-orange-100'}`}
                >
                  Try AI Planner
                </button>
              </div>

              <form onSubmit={handleLocationSearch} className="mt-8 max-w-xl flex flex-col sm:flex-row gap-3">
                <input
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Search chefs near your city"
                  className={`flex-1 px-4 py-3 rounded-lg border ${classes.input.bg} ${classes.input.border} ${classes.input.text}`}
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-5 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>

            <div className={`rounded-xl border ${classes.border.default} ${classes.bg.card} p-6 shadow-lg`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-black text-orange-600">300+</div>
                  <div className={`text-sm ${classes.text.secondary}`}>Chefs</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-orange-600">50+</div>
                  <div className={`text-sm ${classes.text.secondary}`}>Cuisines</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-orange-600">24/7</div>
                  <div className={`text-sm ${classes.text.secondary}`}>Support</div>
                </div>
              </div>
              <div className={`mt-6 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-orange-100'} p-5`}>
                <h2 className={`text-xl font-bold ${classes.text.heading}`}>How it works</h2>
                <div className={`mt-4 space-y-3 text-sm ${classes.text.secondary}`}>
                  <p><span className="font-semibold text-orange-600">1.</span> Tell us your event, guests, budget, and location.</p>
                  <p><span className="font-semibold text-orange-600">2.</span> Choose a chef and confirm the menu, time, and price.</p>
                  <p><span className="font-semibold text-orange-600">3.</span> Create a draft booking. Payment happens only after final confirmation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Services</p>
            <h2 className={`mt-2 text-3xl font-bold ${classes.text.heading}`}>Everything needed for a chef booking.</h2>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {services.map((service) => (
              <div key={service.title} className={`rounded-lg border ${classes.border.default} ${classes.bg.card} p-5`}>
                <h3 className={`text-xl font-bold ${classes.text.heading}`}>{service.title}</h3>
                <p className={`mt-3 ${classes.text.secondary}`}>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className={`py-16 ${isDark ? 'bg-gray-950' : 'bg-orange-50'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">About</p>
            <h2 className={`mt-2 text-3xl font-bold ${classes.text.heading}`}>ChefHub connects homes with verified culinary talent.</h2>
          </div>
          <p className={`text-lg leading-relaxed ${classes.text.secondary}`}>
            We help customers book reliable chefs for events and daily cooking while giving chefs a simple way to manage profiles, availability, and bookings. The AI planner supports the process, but every real booking action stays behind explicit user confirmation.
          </p>
        </div>
      </section>

      <section id="contact" className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Contact</p>
              <h2 className={`mt-2 text-3xl font-bold ${classes.text.heading}`}>Need help with a booking?</h2>
              <p className={`mt-4 ${classes.text.secondary}`}>Reach out for account, chef, booking, or payment support.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {contactItems.map((item) => (
                <div key={item.label} className={`rounded-lg border ${classes.border.default} ${classes.bg.card} p-5`}>
                  <div className={`text-sm ${classes.text.secondary}`}>{item.label}</div>
                  <div className={`mt-2 font-semibold ${classes.text.heading}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/book-chef" className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-center">
              Browse Chefs
            </Link>
            <Link to="/ai-features" className={`px-6 py-3 rounded-lg border font-semibold text-center ${isDark ? 'border-orange-500 text-orange-300 hover:bg-orange-950' : 'border-orange-600 text-orange-700 hover:bg-orange-100'}`}>
              Open AI Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
